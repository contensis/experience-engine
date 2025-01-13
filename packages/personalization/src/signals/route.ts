import { CookieSignals } from "./cookies";
import { UrlSignals } from "./url";
import { ISignalAttributes } from "../models";
import { isObject, now } from "../util";

/** A call to RouteSignalsSnapshot will return a snapshot of the signals for a given url */
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
