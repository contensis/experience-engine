import { Condition, Conditions, IAudience, IAudiencesStore } from "./models";
import { PersonalizationContext } from "./personalization";
import { isSSR, now, objectFromEntries, objectKeys } from "./util";

export type ComputedAudience = IAudience & { matched: boolean };

export class CalculateAudiences {
  #context: PersonalizationContext;
  computed: ComputedAudience[] = [];
  matched: ComputedAudience[] = [];
  t = now();
  get active() {
    return this.state.active;
  }

  /** Return the state of the audiences, checking for newly matched audiences we may not have detected earlier */
  get state() {
    const { computed, matched: matches, t } = this;
    const { debug, manifest, page: p, state } = this.#context;

    // Merge audience matches from this instance into any previously matched
    const matchedPrev: IAudiencesStore["matched"] =
      state.audiences?.matched || {};

    // Create a distinct list of all audience ids
    const allIds = new Set<string>([
      ...matches.map((m) => m.id),
      ...objectKeys(matchedPrev),
    ]);

    const matched: IAudiencesStore["matched"] = {};

    // Iterate all audience ids from this instance and persisted history
    for (const audienceId of allIds) {
      // Did we match this audienceId in this request?
      if (matches.find((m) => m.id === audienceId)) {
        matched[audienceId] = [
          { p, t },
          // // Add prev match(es)
          // ...(matchedPrev[audienceId] || []),
        ];
      } else {
        // Assign previously matched audience, if the audienceId is still available in the manifest
        if (manifest?.audiences.find((a) => a.id === audienceId))
          matched[audienceId] = matchedPrev[audienceId];
      }
    }

    // Activate audiences
    const active: IAudiencesStore["active"] = objectKeys(matched);

    const nextState: IAudiencesStore = {
      computed:
        debug && computed.length
          ? objectFromEntries(
              computed.map((a) => [a.id, [{ p, t, m: a.matched }]])
            )
          : undefined,
      matched,
      active,
    };

    return nextState;
  }

  constructor(context: PersonalizationContext) {
    this.#context = context;

    if (isSSR()) return;

    const { computed, matched: matches } = this;

    for (const audience of context.manifest?.audiences || []) {
      const matched = this.#check(audience.conditions);
      const a = { ...audience, matched };
      if (matched) matches.push(a);
      computed.push(a);
    }
    let matchLen = matches.length;
    let prevLen = 0;
    while (matchLen > prevLen) {
      prevLen = matchLen;
      // Keep checking unmatched audiences to see if we can match
      // further audiences based on a match we've just made
      for (const audience of computed.filter((a) => !a.matched)) {
        const matched = this.#check(audience.conditions);
        if (matched) {
          // mutate the array item here to update computed array
          audience.matched = true;
          matches.push(audience);
          ++matchLen;
        }
      }
    }
    if (matchLen)
      context.l(
        "am",
        matchLen,
        matches.map((m) => m.id)
      );
  }
  /**
   * An audience will contain a collection of conditions wrapped
   * in a single and/or array. Iterate criteria and evaluate
   * each to produce a final boolean match
   */
  #check = (conditions: Conditions) => {
    if ("and" in conditions && conditions.and.length) {
      // All criteria must evaluate true
      for (const and of conditions.and) {
        if ("and" in and || "or" in and) {
          const match = this.#check(and);
          // first failed match will fail the "and" criteria
          if (!match) return false;
        } else if ("not" in and) {
          const match = this.#evaluate(and.not);
          // first successful match will fail the "not" and the outer "and" criteria
          if (match) return false;
        } else {
          const match = this.#evaluate(and);
          // first failed match will fail the "and" criteria
          if (!match) return false;
        }
      }
      // If we have not returned already:
      // - an "and" criteria will have all matched so signal must be true
      return true;
    }

    if ("or" in conditions) {
      // Only one of the criteria must evaluate true
      for (const or of conditions.or) {
        if ("and" in or || "or" in or) {
          const match = this.#check(or);
          // first match will satisfy the "or" criteria
          if (match) return true;
        } else if ("not" in or) {
          const notMatch = !this.#evaluate(or.not);
          // first successful match will satisfy the "not" and the outer "or" criteria
          if (!notMatch) return true;
        } else {
          const match = this.#evaluate(or);
          // first match will satisfy the "or" criteria
          if (match) return true;
        }
      }
      // If we have not returned already:
      // - an "or" criteria would have returned on the first match so signal must be false
      return false;
    }

    return false;
  };

  /** Evaluate one audience condition and return a boolean match */
  #evaluate = (condition: Condition): boolean => {
    if (condition.type === "audience") {
      const match = !!this.active.find(
        (audienceId) => audienceId === condition.id
      );
      return match;
    } else if (condition.type === "signal") {
      const match = !!this.#context.state.signals?.active.find(
        (signalId) => signalId === condition.id
      );
      return match;
    }

    return false;
  };
}
