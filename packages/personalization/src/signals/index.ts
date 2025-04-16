import { EvaluateSignal } from "./evaluate";
import { RouteSignalsSnapshot } from "./route";
import { PersonalizationContext } from "../personalization";
import { findSignal } from "../providers/manifest";
import {
  flattenObject,
  isSSR,
  now,
  objectFromEntries,
  objectKeys,
} from "../util";
import {
  ComputedSignal,
  ISignalAttributes,
  ISignalsStore,
  MatchedSignal,
  Where,
  WhereAttribute,
  WhereCriteria,
} from "../models";
import { AppSignalsSnapshot } from "./app";
import { BrowserSignalsSnapshot } from "./browser";

export class CalculateSignals {
  computed: ComputedSignal[] = [];
  matched: MatchedSignal[] = [];
  snapshot: ISignalAttributes;
  t = now();
  #context: PersonalizationContext;

  constructor(context: PersonalizationContext) {
    this.#context = context;
    const { custom, currentPage, pageViews, previousPage } = context;

    // Find the signals from the last page view
    const previousSignals =
      pageViews.length > 1
        ? pageViews[pageViews.length - 2]?.[2]?.snapshot
        : undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { browser, location, ...sessionSignals } = context.session.state;

    // Hold the signals for this page view and a referrer
    this.snapshot = {
      ...RouteSignalsSnapshot(currentPage, previousSignals || previousPage),
      ...flattenObject(AppSignalsSnapshot(custom)),
      ...flattenObject(sessionSignals, "session"),
      ...flattenObject(BrowserSignalsSnapshot(), "browser"),
      ...flattenObject(location, "location"),
    };
    delete context.custom; // Clear custom attributes so they are not consumed in the next snapshot

    if (isSSR()) return; // Don't compute signals in SSR

    this.#calculate();
  }

  get attributes(): ISignalAttributes {
    const overrides = this.#context.state.overrides || {};
    return { ...this.snapshot, ...overrides };
  }

  /** Return the state of the signals, merging newly matched signals with those previously matched */
  get state() {
    const { computed, matched: matchedThis, t } = this;
    const { debug, manifest, page: p, state } = this.#context;

    // Merge signal matches from this instance into any previously matched
    const matchedPrev: ISignalsStore["matched"] = state.signals?.matched || {};

    const allIds = new Set<string>([
      ...matchedThis.map((m) => m.id),
      ...objectKeys(matchedPrev),
    ]);

    const matched: ISignalsStore["matched"] = {};

    // Iterate all signal keys from this instance and persisted history
    for (const signalId of allIds) {
      // Did we match this signalId in this request?
      const currentMatch = findSignal(signalId, matchedThis);
      // Also check we have not already persisted this current match
      if (currentMatch && !matchedPrev[signalId]?.find((ps) => ps.t === t)) {
        matched[signalId] = [
          { p, t },
          // Add prev match(es) (hard-limited to last 99)
          ...(matchedPrev[signalId] || []).slice(0, 98),
        ];
      } else {
        // No changes just assign prev, if the signalId is included in the manifest
        if (findSignal(signalId, manifest?.signals))
          matched[signalId] = matchedPrev[signalId];
      }
    }

    // Activate signals
    const active: ISignalsStore["active"] = [];

    // Iterate all signal matches and add id to active array if all conditions met
    for (const matchedId in matched) {
      // Get signal from manifest
      const signalManifest = findSignal(matchedId, manifest?.signals);

      // Check have we matched the signal enough times to activate it
      if (
        signalManifest &&
        ((signalManifest.minMatches &&
          matched[matchedId].length >= signalManifest.minMatches) ||
          !signalManifest?.minMatches)
      )
        active.push(matchedId);
    }

    const nextState: ISignalsStore = {
      computed:
        debug && computed.length
          ? objectFromEntries(
              computed.map((s) => [
                s.id,
                [{ p, t, m: s.matched, mm: s.minMatches }],
              ])
            )
          : undefined,
      matched,
      active,
    };

    return nextState;
  }

  /** Iterate computed.signals that are unmatched and check signal criteria for a match */
  redo = () => {
    try {
      const { computed, matched: matches } = this;

      // update any "app" signals set before we recalculate
      this.snapshot = {
        ...this.snapshot,
        ...flattenObject(AppSignalsSnapshot(this.#context.custom)),
      };
      // Clear custom attributes from context so we don't consider them in every page view
      delete this.#context.custom;

      this.t = now();

      // if we have already matched signals, don't match them again
      for (const signal of computed.filter((s) => !s.matched)) {
        const matched = this.#check(signal.where);
        if (matched) {
          // mutate the array item here to update computed array
          signal.matched = true;
          ++signal.times;
          // preview apps may be interfering here so don't push new matches without checking first
          if (!matches.find((m) => m.id === signal.id))
            matches.push(signal as MatchedSignal);
        }
      }
      this.#log();
    } catch (ex: unknown) {
      this.#log(ex);
    }
    return this;
  };

  /** Iterate manifest.signals and check each signal criteria for a match */
  #calculate = () => {
    try {
      const { manifest, state } = this.#context;
      const signals = manifest?.signals || [];
      for (const signal of signals) {
        const matched = this.#check(signal.where);
        const matchedTimes = state.signals?.matched?.[signal.id]?.length || 0;
        const computed = {
          ...signal,
          matched,
          times: matchedTimes + (matched ? 1 : 0),
        };
        if (matched) this.matched.push(computed as MatchedSignal);
        this.computed.push(computed);
      }
      this.#log();
    } catch (ex: unknown) {
      this.#log(ex);
    }
  };

  /**
   * A signal will contain a collection of criteria wrapped
   * in an and/or array. Iterate criteria and evaluate
   * each to produce a final boolean match
   */
  #check = (criteria: Where) => {
    if ("and" in criteria && criteria.and.length) {
      // All criteria must evaluate true
      for (const and of criteria.and) {
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

    if ("or" in criteria) {
      // Only one of the criteria must evaluate true
      for (const or of criteria.or) {
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

  /** Evaluate one where criteria and return a boolean match */
  #evaluate = (criteria: WhereCriteria) => {
    // Guard to prevent crashout caused by invalid criteria
    if (!criteria || !("attribute" in criteria)) return false;

    const [attribute, key] = this.#keyedAttribute(
      criteria.attribute as WhereAttribute
    );
    const signalValue = this.#getSignal(attribute, key);
    const result = EvaluateSignal(criteria, signalValue);
    return result;
  };

  /** Find the value(s) for a given signal attribute */
  #getSignal = (attribute: WhereAttribute, key = "") => {
    const { attributes: snapshot } = this;
    if (attribute === "cookie.*") return snapshot[attribute]?.[key];
    if (
      attribute === "page.queryParams.*" ||
      attribute === "referrer.queryParams.*"
    )
      return snapshot[attribute](key);
    return snapshot[attribute];
  };

  /**
   * Some attributes can be contain a named suffix `page.queryParams.q`
   * Look for specific named attributes and split the key name (q) from
   * the attribute (page.queryParams), appending .* to the named-attribute
   * returning a tuple of [attribute, key] so we can provide the key
   * separately when we find the value for that signal attribute
   */
  #keyedAttribute = (attribute: WhereAttribute): [WhereAttribute, string] => {
    let slices = 0;
    if (attribute.includes(".queryParams.")) slices = 2;
    if (attribute.startsWith("cookie.")) slices = 1;
    const att = slices
      ? (`${attribute
          .split(".")
          .slice(0, slices)
          .join(".")}.*` as WhereAttribute)
      : attribute;
    const key = slices ? attribute.split(".").slice(slices).join(".") : "";

    return [att, key];
  };

  #log = (err?: unknown) => {
    const { matched } = this;
    const { l, manifest } = this.#context;
    const t = now();

    if (err) {
      // console.error(err); // Log error always
      this.#context.session.update({ error: err }); // Log error to session store
      l("serr", err); // Log error when debug logging is enabled
    }

    l("sc", manifest?.signals.length, t - this.t, manifest?.version.versionNo);

    const matches = matched.length;
    if (matches) {
      l(
        "sm",
        matches,
        matched.map((s) => `${s.id}(${s.times} / ${s.minMatches})`).join(", ")
      );
    }
  };
}
