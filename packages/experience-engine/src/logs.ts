export const messages = {
  e: `an unexpected error occurred`,
  pre: `@contensis/experience-engine:`,
  init: `[init] visitorId: {0}, percentile: {1}%, pageViews: {2}`,
  im: `[init] Initialising with supplied manifest`,
  ic: `[init] Initialising manifest with client`,
  mu: `[onManifestReady] Updated to user-supplied version "{0}" from version "{1}"`,
  mp: `[onManifestReady] Updated to preview version "{0}" from version "{1}"`,
  mv: `[onManifestReady] Updated to version "{0}" from version "{1}"`,
  ml: `[onManifestReady] Location updated "{0}" from "{1}"`,
  ms: `[onManifestReady] Matched new signals from updated manifest`,
  ma: `[onManifestReady] Matched new audiences from updated manifest`,
  n1: `[observe] Initial page view: {0}`,
  n2: `[observe] Route change detected: from {0} to: {1}`,
  m: `[Manifest] Fallback to manifest found in state while we initialise`,
  pv: `[pageView] pageViews: {0}`,
  pn: `[pageView] no current page in state; referrer: {0}`,
  pc: `[pageView] current page in state has changed; referrer: {0}`,
  ps: `[pageView] current page in state has not changed; referrer: {0}`,
  pm: `[pageView] manifest is not ready yet`,
  am: `[Audiences] {0} matched: {1}`,
  sc: `[Signals] {0} checked in {1}ms, manifest version "{2}"`,
  sm: `[Signals] {0} matched: {1}`,
  serr: `[Signals] an error occurred when calculating`,
} as const;

/**
 * Logger function to take a key from the messages object above
 * and log the message while interpolating any further supplied values
 * and raw output any non-interpolated values
 */
export const logger = (key: keyof typeof messages, ...values: unknown[]) => {
  const count = values.length;
  let matched = 0;
  console[key.includes("err") ? "error" : "log"](
    messages.pre,
    messages[key]?.replace(/{([0-9]+)}/g, (match: string, index: number) => {
      matched++;
      return typeof values[index] === "undefined"
        ? match
        : typeof values[index] === "object" && values[index]
        ? JSON.stringify(values[index], null, 2)
        : (values[index] as string);
    }) || key,
    // Output any values we haven't matched in the string
    matched < count ? values.slice(matched, count) : ""
  );
};
