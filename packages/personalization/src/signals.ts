import { ISignalsStore, Where, WhereCriteria } from "./models";
import { ISignalAttributes } from "./models/ISignalAttributes";
import { ComputedSignal } from "./models/Signals";
import { PersonalizationContext } from "./personalization";
import { findSignal } from "./providers/manifest";
import { cookieStore } from "./providers/store";
import {
  isArray,
  isNullOrUndefined,
  isNumber,
  isObject,
  isSSR,
  isString,
  isUndefined,
  now,
  trimToLower,
} from "./util";

export const CookieSignals = () => {
  const string = cookieStore.getString() || "";
  const cookies = cookieStore.getAll() || ({} as { [key: string]: string });

  return {
    cookies,
    get: (name: string) => cookies[name],
    string,
  };
};

export const UrlSignals = (page: string) => {
  const url = !isSSR() ? new URL(page) : new URL("ssr://");
  return {
    url,
    href: () => url.href,
    domain: () => url.hostname,
    path: () => url.pathname,
    subdomain: () => {
      const parts = url.hostname.split(".");
      // searching for all valid tlds will add approx 40KB to the bundle
      // instead we will just return the first portion of the subdomain
      // my.example.company.co.uk will return just "my"
      return parts?.[0];
    },
    baseUrl: () => `${url.origin}${url.pathname}`,
    querystring: () => url.search,
    queryParam: (name: string) => url.searchParams.getAll(name),
    queryParams: () => {
      const params = url.searchParams;
      params.sort();
      return Object.fromEntries(params.entries());
    },
  };
};

/** A call to RouteSignals instance will return a snapshot of the signals for a given url */
export const RouteSignalsSnapshot = (
  url: string,
  referrer?: string | ISignalAttributes
): ISignalAttributes => {
  const _cookie = CookieSignals();
  const _url = UrlSignals(url);
  let _referrer: ISignalAttributes | undefined;

  // Gather signals for a referrer using previously collected signals or
  // new signals based on a previous or referrer url
  if (isObject(referrer)) _referrer = referrer;
  else if (referrer) _referrer = RouteSignalsSnapshot(referrer);

  const attributes: ISignalAttributes = {
    t: now(),
    "page.url": _url.href(),
    "page.path": _url.path(),
    pageUrl: _url.path(),
    "page.querystring": _url.querystring(),
    "page.queryParams.*": (name: string) => _url.queryParam(name),
    // "page.queryParams.*": _url.queryParams(),
    "page.domain": _url.domain(),
    "page.subdomain": _url.subdomain(),
    "page.baseUrl": _url.baseUrl(),
    "referrer.url": _referrer?.["page.url"],
    "referrer.path": _referrer?.["page.path"],
    "referrer.querystring": _referrer?.["page.querystring"],
    "referrer.queryParams.*": (name: string) =>
      _referrer?.["page.queryParams.*"](name),
    // "referrer.queryParams.*": _referrer?._url.queryParams(),
    "referrer.domain": _referrer?.["page.domain"],
    "referrer.subdomain": _referrer?.["page.subdomain"],
    "referrer.baseUrl": _referrer?.["page.baseUrl"],
    cookie: _cookie.string,
    "cookie.*": _cookie.cookies,
  };

  return attributes;
};

export class CalculateSignals {
  computed: ComputedSignal[] = [];
  matched: ComputedSignal[] = [];
  signals: ISignalAttributes;
  t = now();

  // get matched() {
  //   return this.computed.filter((s) => s.matched);
  // }

  /** Return the state of the signals, merging newly matched signals with those previously matched */
  get state() {
    const { computed, context, matched: matchedThis, signals } = this;
    const { debug, manifest, page: p, state } = context;

    // Merge signal matches from this instance into any previously matched
    // const matchedThis = this.matched;
    const matchedPrev: ISignalsStore["matched"] = state.signals?.matched || {};

    const allIds = new Set<string>([
      ...matchedThis.map((m) => m.id),
      ...Object.keys(matchedPrev),
    ]);

    const matched: ISignalsStore["matched"] = {};

    // Iterate all signal keys from this instance and persisted history
    for (const signalId of allIds) {
      // Did we match this signalId in this request?
      const currentMatch = findSignal(signalId, matchedThis);
      if (currentMatch) {
        matched[signalId] = [
          { p, t: signals.t },
          // Add prev match(es)s
          ...(matchedPrev[signalId] || []),
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
    for (const [matchedId, match] of Object.entries(matched)) {
      // Get signal from manifest
      const signalManifest = findSignal(matchedId, manifest?.signals);

      // Check have we matched the signal enough times to activate it
      if (
        signalManifest?.minMatches &&
        match.length >= signalManifest.minMatches
      )
        active.push(matchedId);
    }

    const nextState: ISignalsStore = {
      computed:
        debug && computed.length
          ? Object.fromEntries(
              computed.map((s) => [
                s.id,
                [{ p, t: signals.t, m: s.matched, mm: s.minMatches }],
              ])
            )
          : undefined,
      matched,
      active,
    };

    return nextState;
  }

  constructor(private context: PersonalizationContext) {
    const { currentPage, l, manifest, pageViews, previousPage } = context;

    // Find the signals from the last page view
    const previousSignals =
      pageViews.length > 1
        ? pageViews[pageViews.length - 2]?.[2]?.signals
        : undefined;

    // Hold the signals for this page view and a referrer
    this.signals = RouteSignalsSnapshot(
      currentPage,
      previousSignals || previousPage
    );

    if (isSSR()) return; // Don't compute signals in SSR

    const signals = manifest?.signals || [];
    // log(
    //   `[Signals] checking ${signals.length} signals in manifest version "${manifest?.version.versionNo}"`
    // );
    // const timeStart = now();
    for (const signal of signals) {
      const matched = this.check(signal.where);
      const times =
        (context.state.signals?.matched?.[signal.id]?.length || 0) + 1;
      const computed = { ...signal, matched, times };
      if (matched) this.matched.push(computed);
      this.computed.push(computed);
    }
    // log(
    //   `[Signals] ${signals.length} checked in ${
    //     now() - timeStart
    //   }ms, manifest version "${manifest?.version.versionNo}`
    // );
    l("sc", signals.length, now() - this.t, manifest?.version.versionNo);

    const matches = this.matched.length;
    if (matches) {
      // log(
      //   `[Signals] ${matches} matched: ${this.matched.map(
      //     (m) =>
      //       `${m.id}(${
      //         (context.state.signals?.matched?.[m.id]?.length || 0) + 1
      //       }/${m.minMatches}) `
      //   )}`
      // );
      l(
        "sm",
        matches,
        this.matched.map(
          (signal) => `${signal.id}(${signal.times}/${signal.minMatches}) `
        )
      );
    }
  }
  /**
   * A signal will contain a collection of criteria wrapped
   * in an and/or array. Iterate criteria and evaluate
   * each to produce a final boolean match
   */
  check = (criteria: Where) => {
    if ("and" in criteria && criteria.and.length) {
      // All criteria must evaluate true
      for (const and of criteria.and) {
        if ("and" in and || "or" in and) {
          const match = this.check(and);
          // first failed match will fail the "and" criteria
          if (!match) return false;
        } else if ("not" in and) {
          const match = this.evaluate(and.not);
          // first successful match will fail the "not" and the outer "and" criteria
          if (match) return false;
        } else {
          const match = this.evaluate(and);
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
          const match = this.check(or);
          // first match will satisfy the "or" criteria
          if (match) return true;
        } else if ("not" in or) {
          const notMatch = !this.evaluate(or.not);
          // first successful match will satisfy the "not" and the outer "or" criteria
          if (!notMatch) return true;
        } else {
          const match = this.evaluate(or);
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
  evaluate = (criteria: WhereCriteria) => {
    const [attribute, key] = this.keyedAttribute(criteria.attribute);
    const signalValue = this.getSignal(attribute, key);
    const evaluation = new Evaluate(criteria, signalValue);
    return evaluation.result;
  };

  /** Find the value(s) for a given signal attribute */
  getSignal = (attribute: string, key = "") => {
    const { signals } = this;
    if (attribute === "cookie.*") return signals[attribute]?.[key];
    if (attribute.endsWith(".queryParams.*"))
      return signals[
        attribute as "page.queryParams.*" | "referrer.queryParams.*"
      ](key);
    return signals[
      attribute as
        | "cookie"
        | "pageUrl"
        | "page.url"
        | "page.path"
        | "page.querystring"
        | "page.domain"
        | "page.subdomain"
        | "page.baseUrl"
        | "referrer.url"
        | "referrer.path"
        | "referrer.querystring"
        | "referrer.domain"
        | "referrer.subdomain"
        | "referrer.baseUrl"
    ];
  };

  /**
   * Some attributes can be contain a named suffix `page.queryParams.q`
   * Look for specific named attributes and split the key name (q) from
   * the attribute (page.queryParams), appending .* to the named-attribute
   * returning a tuple of [attribute, key] so we can provide the key
   * separately when we find the value for that signal attribute
   */
  keyedAttribute = (attribute: string) => {
    let slices = 0;
    if (attribute.includes(".queryParams.")) slices = 2;
    if (attribute.includes("cookie.")) slices = 1;
    const att = slices
      ? `${attribute.split(".").slice(0, slices).join(".")}.*`
      : attribute;
    const key = slices ? attribute.split(".").slice(slices).join(".") : "";

    return [att, key];
  };
}

type SignalValue = string | number | undefined;

class Evaluate<T extends SignalValue | SignalValue[]> {
  result = false;
  constructor(public criteria: WhereCriteria, public value: T) {
    this.result = this.process(value);
  }

  /** Evaluate a single criteria from an array of resolved values and return a boolean match */
  private process = (value: SignalValue | SignalValue[]) => {
    let match = false;
    if (Array.isArray(value)) {
      for (const item of value) {
        match = this.eval(item);
        if (match) break;
      }
    } else {
      match = this.eval(value);
    }
    return match;
  };

  /** Evaluate a single criteria with a resolved value and return a boolean match */
  private eval = (value: SignalValue) => {
    const {
      contains,
      equalTo,
      exists,
      greaterThan,
      in: equalsIn, // can't have a var called "in"
      lessThan,
      matchesRegex,
      startsWith,
    } = this.criteria;

    // check for known operator types
    if (!isUndefined(contains) && isString(value))
      return value.includes(contains);

    if (!isUndefined(equalTo) && !isUndefined(value))
      if (isString(value)) return trimToLower(value) === trimToLower(equalTo);
      else return value == (equalTo as unknown);

    if (!isUndefined(equalsIn) && isArray(equalsIn) && !isUndefined(value))
      return equalsIn.map((ic) => trimToLower(ic)).includes(trimToLower(value));

    if (!isUndefined(exists)) return !isNullOrUndefined(value);

    if (!isUndefined(greaterThan) && isNumber(value))
      return value > greaterThan;

    if (!isUndefined(lessThan) && isNumber(value)) return value < lessThan;

    if (!isUndefined(matchesRegex) && !isUndefined(value))
      new RegExp(matchesRegex).test(`${value}`);

    if (!isUndefined(startsWith) && isString(value))
      return trimToLower(value).startsWith(trimToLower(startsWith));

    return false;
  };
}
