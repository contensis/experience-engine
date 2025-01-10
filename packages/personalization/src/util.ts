import { IPersonalizationStore } from "./models";
import { ManifestClient } from "./providers/manifest-client";

export const isSSR = () => typeof window === "undefined";

export const now = (): EpochTimeStamp => +new Date();

export const utcDate = (value: number) => new Date(value).toUTCString();

export const tryParse = <T>(stringified: string) => {
  try {
    // try to unstringify a found value
    return JSON.parse(stringified || "") as T;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    return stringified as T | undefined;
  }
};

export const trimToLower = (val: string | number) =>
  `${val}`.trim().toLowerCase();

export const isArray = (arr: unknown): arr is Array<unknown> =>
  Array.isArray(arr);
export const isNullOrUndefined = (val: unknown): val is null | undefined =>
  val === null || typeof val === "undefined";
export const isNumber = (val: unknown): val is number =>
  typeof val === "number";
export const isObject = (val: unknown) => !!val && typeof val === "object";
export const isStore = (store: unknown): store is IPersonalizationStore =>
  isObject(store) && "cpid" in store;
export const isString = (val: unknown): val is string =>
  typeof val === "string";
export const isUndefined = (val: unknown): val is undefined =>
  typeof val === "undefined";

export const isManifestClient = (
  client: unknown
): client is ReturnType<typeof ManifestClient> =>
  isObject(client) && "get" in client;
