import { ISignal, ISignalsStore, WhereCriteria } from "./models";
import { PersonalizationContext } from "./personalization";
import { cookieStore } from "./providers/store";
import {
  isArray,
  isNullOrUndefined,
  isNumber,
  isSSR,
  isString,
  isUndefined,
  trimToLower,
} from "./util";

export class CookieSignals {
  cookies: { [name: string]: string };
  string: string;

  constructor() {
    this.string = cookieStore.getString() || "";
    this.cookies = cookieStore.getAll() || {};
  }
  get = (name: string) => this.cookies[name];
}

export class UrlSignals {
  url: URL;

  constructor(url: string) {
    this.url = !isSSR() ? new URL(url) : new URL("ssr://");
  }

  href = () => this.url.href;
  domain = () => this.url.hostname;
  path = () => this.url.pathname;
  subdomain = () => {
    const parts = this.url.hostname.split(".");
    // searching for all valid tlds will add approx 40KB to the bundle
    // instead we will just return the first portion of the subdomain
    // my.example.company.co.uk will return just "my"
    return parts?.[0];
  };
  baseUrl = () => this.url.origin;
  querystring = () => this.url.search;
  queryParam = (name: string) => this.url.searchParams.getAll(name);
  queryParams = () => {
    const params = this.url.searchParams;
    params.sort();
    return Object.fromEntries(params.entries());
  };
}

export class SignalAttributes {
  pageUrl: string = "";
  "page.url": string = "";
  "page.path": string = "";
  "page.querystring": string = "";
  "page.queryParams.*": { [key: string]: string } = {};
  "page.domain": string = "";
  "page.subdomain": string = "";
  "page.baseUrl": string = "";
  "referrer.url"?: string = "";
  "referrer.path"?: string = "";
  "referrer.querystring"?: string = "";
  "referrer.queryParams.*"?: { [key: string]: string } = {};
  "referrer.domain"?: string = "";
  "referrer.subdomain"?: string = "";
  "referrer.baseUrl"?: string = "";
  cookie: string = "";
  "cookie.*": { [key: string]: string } = {};
}

/** A Signals instance will hold a snapshot of the signals for a given url */
export class Signals extends SignalAttributes {
  referrer?: Signals;
  timestamp = +new Date();

  private _cookie: CookieSignals;
  private _url: UrlSignals;

  constructor(url: string, referrer?: string | Signals) {
    super();
    this._cookie = new CookieSignals();
    this._url = new UrlSignals(url);

    // Gather signals for a referrer using previously collected signals or
    // new signals based on a previous or referrer url
    if (referrer instanceof Signals) this.referrer = referrer;
    else if (referrer) this.referrer = new Signals(referrer);

    const attributes: SignalAttributes = {
      "page.url": this._url.href(),
      "page.path": this._url.path(),
      pageUrl: this._url.path(),
      "page.querystring": this._url.querystring(),
      "page.queryParams.*": this._url.queryParams(),
      "page.domain": this._url.domain(),
      "page.subdomain": this._url.subdomain(),
      "page.baseUrl": this._url.baseUrl(),
      "referrer.url": this.referrer?._url.href(),
      "referrer.path": this.referrer?._url.path(),
      "referrer.querystring": this.referrer?._url.querystring(),
      "referrer.queryParams.*": this.referrer?._url.queryParams(),
      "referrer.domain": this.referrer?._url.domain(),
      "referrer.subdomain": this.referrer?._url.subdomain(),
      "referrer.baseUrl": this.referrer?._url.baseUrl(),
      cookie: this._cookie.string,
      "cookie.*": this._cookie.cookies,
    };

    Object.assign(this, attributes);
  }
  // "page.path" = () => this._url.path();
  // pageUrl = this["page.path"];
  // "page.querystring" = () => this._url.querystring();
  // "page.queryParams.*" = (key: string) => this._url.queryParam(key);
  // "page.domain" = () => this._url.domain();
  // "page.subdomain" = () => this._url.subdomain();
  // "page.baseUrl" = () => this._url.baseUrl();
  // "referrer.url" = () => this.referrer?._url.href();
  // "referrer.path" = () => this.referrer?._url.path();
  // "referrer.querystring" = () => this.referrer?._url.querystring();
  // "referrer.queryParams.*" = (key: string) =>
  //   this.referrer?._url.queryParam(key);
  // "referrer.domain" = () => this.referrer?._url.domain();
  // "referrer.subdomain" = () => this.referrer?._url.subdomain();
  // "referrer.baseUrl" = () => this.referrer?._url.baseUrl();
  // "cookie" = () => this._cookie.string;
  // "cookie.*" = (key: string) => this._cookie.get(key);
}

export type ComputedSignal = ISignal & { matched: boolean };

export class CalculateSignals {
  computed: ComputedSignal[] = [];
  signals: Signals;

  get matched() {
    return this.computed.filter((s) => s.matched);
  }

  /** Return the state of the signals, merging newly matched signals with those previously matched */
  get state() {
    // Merge signal matches from this instance into any previously matched
    const matchedThis = this.matched;
    const matchedPrev: ISignalsStore["matched"] =
      this.context.state.signals?.matched || {};

    const allIds = new Set<string>([
      ...this.matched.map((m) => m.id),
      ...Object.keys(matchedPrev),
    ]);

    const matched: ISignalsStore["matched"] = {};

    // Iterate all signal keys from this instance and persisted history
    for (const signalId of allIds) {
      // Did we match this signalId in this request?
      const currentMatch = matchedThis.find((m) => m.id === signalId);
      if (currentMatch) {
        matched[signalId] = [
          { p: this.context.page!, t: this.signals.timestamp },
          // Add prev match(es)s
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
                  t: this.signals.timestamp,
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
    // Find the signals from the last page view
    const previousSignals =
      this.context.pageViews.length > 1
        ? this.context.pageViews[this.context.pageViews.length - 2]?.[2]
            ?.signals
        : undefined;

    // Hold the signals for this page view and a referrer
    this.signals = new Signals(
      this.context.currentPage,
      previousSignals || this.context.previousPage
    );

    if (isSSR()) return; // Don't compute signals in SSR

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
              (this.context.state.signals?.matched?.[m.id]?.length || 0) + 1
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
        if ("not" in and) {
          const match = this.evaluateCriteria(and.not);
          // first successful match will fail the "not" and the outer "and" criteria
          if (match) return false;
        } else {
          const match = this.evaluateCriteria(and);
          // first failed match will fail the "and" criteria
          if (!match) return false;
        }
      }
      // If we have not returned already:
      // - an "and" criteria will have all matched so signal must be true
      return true;
    }

    if ("or" in signal.where) {
      // Only one of the criteria must evaluate true
      for (const or of signal.where.or) {
        if ("not" in or) {
          const notMatch = !this.evaluateCriteria(or.not);
          // first successful match will satisfy the "not" and the outer "or" criteria
          if (!notMatch) return true;
        } else {
          const match = this.evaluateCriteria(or);
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
  evaluateCriteria = (crit: WhereCriteria) => {
    const [attribute, key] = this.checkNamedAttribute(crit.attribute);
    const signalValue = this.getSignalValue(attribute, key);
    const evaluation = new SignalCriteriaEvaluation(crit, signalValue);
    return evaluation.result;
  };

  /** Find the value(s) for a given signal attribute */
  getSignalValue = (attribute: string, key = "") => {
    switch (attribute) {
      case "pageUrl":
      case "page.url":
      case "page.path":
      case "page.querystring":
      case "page.domain":
      case "page.subdomain":
      case "page.baseUrl":
      case "referrer.url":
      case "referrer.path":
      case "referrer.querystring":
      case "referrer.domain":
      case "referrer.subdomain":
      case "referrer.baseUrl":
      case "cookie":
        return this.signals[attribute];
      case "page.queryParams.*":
      case "referrer.queryParams.*":
      case "cookie.*":
        return this.signals[attribute]?.[key];
      default:
        // some other attribute type
        break;
    }
  };

  /**
   * Some attributes can be contain a named suffix `page.queryParams.q`
   * Look for specific named attributes and split the key name (q) from
   * the attribute (page.queryParams), appending .* to the named-attribute
   * returning a tuple of [attribute, key] so we can provide the key
   * separately when we find the value for that signal attribute
   */
  checkNamedAttribute = (attribute: string) => {
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
    const {
      contains,
      equals,
      exists,
      greaterThan,
      in: equalsIn, // can't use a var called "in"
      lessThan,
      matchesRegex,
      startsWith,
    } = this.criteria;

    // check for known operator types
    if (!isUndefined(contains) && isString(value))
      return value.includes(contains);

    if (!isUndefined(equals) && !isUndefined(value))
      if (isString(value)) return trimToLower(value) === trimToLower(equals);
      else return value == (equals as unknown);

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
