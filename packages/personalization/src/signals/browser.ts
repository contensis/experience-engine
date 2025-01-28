import { IBrowserSignalAttributes } from "../models";
import { isSSR } from "../util";

/** A call to BrowserSignalsSnapshot will return a snapshot of the signals for a current session */
export const BrowserSignalsSnapshot = (): IBrowserSignalAttributes => {
  if (isSSR()) return {} as IBrowserSignalAttributes;

  const attributes: IBrowserSignalAttributes = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    vendor: navigator.vendor,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    touchSupport: "ontouchstart" in window,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
  };

  return attributes;
};
