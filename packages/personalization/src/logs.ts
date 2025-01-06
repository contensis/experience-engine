import { isObject, isUndefined } from "./util";

export const messages = {
  pre: `@contensis/personalization:`,
  init: `[init] visitorId: {0}, percentile: {1}%, pageViews: {2}`,
  im1: `[init] Initialising with supplied manifest`,
  im2: `[init] Initialising manifest with client`,
  m1: `[onManifestReady] Updated to version "{0}" from version "{1}"`,
  m2: `[onManifestReady] Matched new signals from updated manifest`,
  m3: `[onManifestReady] Matched new audiences from updated manifest`,
  n1: `[observe] Initial page view: {0}`,
  n2: `[observe] Route change detected: from {0} to: {1}`,
  m: `[Manifest] Fallback to manifest found in state while we initialise`,
  pv1: `[pageView] no current page in state; referrer: {0}`,
  pv2: `[pageView] current page in state has changed; referrer: {0}`,
  pv3: `[pageView] current page in state has not changed; referrer: {0}`,
  pv4: `[pageView] pageViews: {0}`,
  pv5: `[pageView] manifest is not ready yet`,
  am: `[Audiences] {0} matched: {1}`,
  sc: `[Signals] {0} checked in {1}ms, manifest version "{2}"`,
  sm: `[Signals] {0} matched: {1}`,
} as const;

/**
 * Logger function to take a key from the messages object above
 * and log the message while interpolating any further supplied values
 * and raw output any non-interpolated values
 */
export const logger = (key: keyof typeof messages, ...values: unknown[]) => {
  const count = values.length;
  let matched = 0;
  console.log(
    messages.pre,
    messages[key]?.replace(/{([0-9]+)}/g, (match: string, index: number) => {
      matched++;
      return isUndefined(values[index])
        ? match
        : isObject(values[index])
        ? JSON.stringify(values[index], null, 2)
        : (values[index] as string);
    }) || key,
    // Output any values we haven't matched in the string
    matched < count ? values.slice(matched, count) : ""
  );
};
