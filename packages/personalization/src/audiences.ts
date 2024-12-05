import {
  ConditionsAnd,
  ConditionsOr,
  IAudience,
  IAudiencesStore,
} from "./models";
import { PersonalizationContext } from "./personalization";
import { isSSR } from "./util";

export type ComputedAudience = IAudience & { matched: boolean };

export class CalculateAudiences {
  private timestamp = new Date().getTime();
  computed: ComputedAudience[] = [];

  get matched() {
    return this.computed.filter((s) => s.matched);
  }

  /** Return the state of the audiences, checking for newly matched audiences we may not have detected earlier */
  get state() {
    // Merge audience matches from this instance into any previously matched
    const matchedThis = this.matched;
    const matchedPrev: IAudiencesStore["matched"] =
      this.context.state.audiences?.matched || {};

    // Create a distinct list of all audience ids
    const allIds = new Set<string>([
      ...this.matched.map((m) => m.id),
      ...Object.keys(matchedPrev),
    ]);

    const matched: IAudiencesStore["matched"] = {};

    // Iterate all audience ids from this instance and persisted history
    for (const audienceId of allIds) {
      // Did we match this audienceId in this request?
      if (matchedThis.find((m) => m.id === audienceId)) {
        matched[audienceId] = [
          { p: this.context.page!, t: this.timestamp },
          // // Add prev match(es)
          // ...(matchedPrev[audienceId] || []),
        ];
      } else {
        // Assign previously matched audience, if the audienceId is still available in the manifest
        if (this.context.manifest?.audiences.find((a) => a.id === audienceId))
          matched[audienceId] = matchedPrev[audienceId];
      }
    }

    // Activate audiences
    const active: IAudiencesStore["active"] = Object.keys(matched);

    const nextState: IAudiencesStore = {
      computed:
        this.context.debug && this.computed.length
          ? Object.fromEntries(
              this.computed.map((a) => [
                a.id,
                [
                  {
                    p: this.context.page!,
                    t: this.timestamp,
                    m: a.matched,
                  },
                ],
              ])
            )
          : undefined,
      matched,
      active,
    };

    return nextState;
  }

  constructor(private context: PersonalizationContext) {
    if (isSSR()) return;
    for (const audience of this.context.manifest?.audiences || []) {
      this.computed.push({
        ...audience,
        matched: this.check(audience),
      });
    }
    const num = this.matched.length;
    let matchLen = -1;
    while (matchLen === -1 || matchLen > num) {
      // Keep checking unmatched audiences to see if we can match
      // further audiences based on a match we've just made
      for (const audience of this.computed.filter((a) => !a.matched)) {
        this.computed.push({
          ...audience,
          matched: this.check(audience),
        });
      }
      matchLen = this.matched.length;
    }
    if (matchLen)
      this.context.log(
        `${matchLen} audiences matched: ${this.matched.map((m) => m.id)}`
      );
  }
  /**
   * An audience will contain a collection of conditions wrapped
   * in a single and/or array. Iterate criteria and evaluate
   * each to produce a final boolean match
   */
  check = (audience: IAudience) => {
    if ("and" in audience.conditions && audience.conditions.and.length) {
      // All criteria must evaluate true
      for (const and of audience.conditions.and) {
        const match = this.evaluate(and);
        // first failed match will fail the "and" criteria
        if (!match) return false;
      }
      // If we have not returned already:
      // - an "and" criteria will have all matched so signal must be true
      return true;
    }

    if ("or" in audience.conditions) {
      // Only one of the criteria must evaluate true
      for (const or of audience.conditions.or) {
        const match = this.evaluate(or);
        // first match will satisfy the "or" criteria
        if (match) return true;
      }
      // If we have not returned already:
      // - an "or" criteria would have returned on the first match so signal must be false
      return false;
    }

    return false;
  };

  /** Evaluate one audience condition and return a boolean match */
  evaluate = (condition: ConditionsAnd | ConditionsOr) => {
    if ("and" in condition) {
      for (const and of condition.and) {
        const match = this.evaluate(and);
        // first failed match will fail the "and" criteria
        if (!match) return false;
      }
    } else if ("or" in condition) {
      for (const or of condition.or) {
        const match = this.evaluate(or);
        // first match will satisfy the "or" criteria
        if (match) return true;
      }
      // If we have not returned already:
      // - an "or" criteria would have returned on the first match so signal must be false
      return false;
    } else if (condition.type === "audience") {
      const match = !!this.context.state.audiences?.active.find(
        (audienceId) => audienceId === condition.id
      );
      return match;
    } else if (condition.type === "signal") {
      const match = !!this.context.state.signals?.active.find(
        (signalId) => signalId === condition.id
      );
      return match;
    }

    return false;
  };
}
