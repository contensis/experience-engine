import { ISignal, ISignalsStore, WhereCriteria } from "./models";
import { PersonalizationContext } from "./personalization";
import { cookieStore } from "./store";
import { isNumber, isSSR, isString, isUndefined } from "./util";

export class UrlSignals {
  get url() {
    return !isSSR() ? new URL(window.location.href) : new URL("ssr://");
  }
  constructor() {}

  hostname = () => this.url.hostname;
  path = () => this.url.pathname;
  queryString = () => {
    const params = this.url.searchParams;

    params.sort();

    const qsObject = Object.fromEntries(params.entries());
    return {
      $keys: Object.keys(qsObject),
      ...qsObject,
    };
  };
}

export class Signals {
  static pageUrl = () => {
    const url = new URL(window.location.href);
    return url;
  };
  static url = new UrlSignals();
  static cookie = (name: string) => cookieStore.get({ key: name });
  static cookies = () => {
    const obj = cookieStore.getAll();
    return {
      $keys: Object.keys(obj || {}),
      ...obj,
    };
  };
}

export type ComputedSignal = ISignal & { matched: boolean };

export class CalculateSignals {
  computed: ComputedSignal[] = [];

  get matched() {
    return this.computed.filter((s) => s.matched);
  }

  /** Return the state of the signals, merging newly matched signals with those previously matched */
  get state() {
    const timestamp = new Date().getTime();

    // Merge signal matches from this instance into any previously matched
    const matchedThis = this.matched;
    const matchedPrev: ISignalsStore["matched"] =
      this.context.state.signals?.matched || {};

    const allIds = new Set<string>([
      ...this.matched.map((m) => m.id),
      ...Object.keys(matchedPrev || {}),
    ]);

    const matched: ISignalsStore["matched"] = {};

    // Iterate all signal keys from this instance and persisted history
    for (const signalId of allIds) {
      // Did we match this signalId in this request?
      const currentMatch = matchedThis.find((m) => m.id === signalId);
      if (currentMatch) {
        matched[signalId] = [
          { p: this.context.page!, t: timestamp },
          // Add prev match(es)
          ...(matchedPrev[signalId] || []),
        ];
      } else {
        // No changes just assign prev, if the signalId is included in the manifest
        if (this.context.manifest?.signals.find((s) => s.id === signalId))
          matched[signalId] = matchedPrev[signalId];
      }
    }

    // Activate signals
    const active: ISignalsStore["active"] = [];

    // Iterate all signal matches and add id to active array if all conditions met
    for (const [matchedId, match] of Object.entries(matched)) {
      // Get signal from manifest
      const signalManifest = this.context.manifest?.signals.find(
        (s) => s.id === matchedId
      );

      // Check have we matched the signal enough times to activate it
      if (
        signalManifest?.minMatches &&
        match.length >= signalManifest.minMatches
      )
        active.push(matchedId);
    }

    const nextState: ISignalsStore = {
      computed: this.computed.length
        ? Object.fromEntries(
            this.computed.map((s) => [
              s.id,
              [
                {
                  p: this.context.page!,
                  t: timestamp,
                  m: s.matched,
                  mm: s.minMatches,
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
    for (const signal of this.context.manifest?.signals || []) {
      this.computed.push({
        ...signal,
        matched: this.checkSignal(signal),
      });
    }

    if (this.matched.length)
      this.context.log(
        `${this.matched.length} signals matched: ${this.matched.map(
          (m) =>
            `${m.id}(${
              (this.context.state.signals?.matched?.[m.id].length || 0) + 1
            }/${m.minMatches})`
        )}`
      );
  }
  /**
   * A signal will contain a collection of criteria wrapped
   * in a single and/or array. Iterate criteria and evaluate
   * each to produce a final boolean match
   */
  checkSignal = (signal: ISignal) => {
    if ("and" in signal.where && signal.where.and.length) {
      // All criteria must evaluate true
      for (const and of signal.where.and) {
        const match = this.evaluateCriteria(and);
        // first failed match will fail the "and" criteria
        if (!match) return false;
      }
      // If we have not returned already:
      // - an "and" criteria will have all matched so signal must be true
      return true;
    }

    if ("or" in signal.where) {
      // Only one of the criteria must evaluate true
      for (const or of signal.where.or) {
        const match = this.evaluateCriteria(or);
        // first match will satisfy the "or" criteria
        if (match) return true;
      }
      // If we have not returned already:
      // - an "or" criteria would have returned on the first match so signal must be false
      return false;
    }

    return false;
  };

  /** Evaluate one where criteria and return a boolean match */
  evaluateCriteria = (crit: WhereCriteria) => {
    const signalValue = this.getSignalValue(crit.attribute);
    const evaluation = new SignalCriteriaEvaluation(crit, signalValue);
    return evaluation.result;
  };

  /** Find the value(s) for a given signal type */
  getSignalValue = (attribute: string) => {
    // check for known attribute types
    switch (attribute) {
      case "page.uri":
      case "page.url":
      case "pageUrl":
        return Signals.url.path();
      case "page.query":
        return Signals.url.queryString().$keys;
      case "cookie.name":
        return Signals.cookies().$keys;
      default:
        // some other attribute type
        break;
    }
  };
}

type SignalValue = string | number | undefined;

class SignalCriteriaEvaluation<T extends SignalValue | SignalValue[]> {
  result = false;
  constructor(public criteria: WhereCriteria, public value: T) {
    if (Array.isArray(value))
      this.result = this.processCriteriaFromArray(value);
    else this.result = this.processCriteria(value);
  }

  /** Evaluate a single criteria from an array of resolved values and return a boolean match */
  private processCriteriaFromArray = (arr: SignalValue[]) => {
    let match = false;
    for (const item of arr) {
      match = this.processCriteria(item);
      if (match) break;
    }
    return match;
  };

  /** Evaluate a single criteria with a resolved value and return a boolean match */
  private processCriteria = (value: SignalValue) => {
    const { contains, equals, greaterThan, lessThan, startsWith } =
      this.criteria;

    // check for known operator types
    if (!isUndefined(contains) && isString(value))
      return value.includes(contains);

    if (!isUndefined(equals) && !isUndefined(value))
      if (isString(value))
        return value.trim().toLowerCase() === equals.trim().toLowerCase();
      else return value == (equals as unknown);

    if (!isUndefined(greaterThan) && isNumber(value))
      return value > greaterThan;

    if (!isUndefined(lessThan) && isNumber(value)) return value < lessThan;

    if (!isUndefined(startsWith) && isString(value))
      return value
        .trim()
        .toLowerCase()
        .startsWith(startsWith.trim().toLowerCase());

    return false;
  };
}
