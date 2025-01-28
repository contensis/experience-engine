import { IPersonalizationSessionStore, IPersonalizationStore } from "./models";
import { ManifestClient } from "./providers/manifest-client";

export const isSSR = () => typeof window === "undefined";

export const dateNow = () => new Date();

export const now = (): EpochTimeStamp => +dateNow();

export const date = (value: number | string | Date) => new Date(value);

export const isoDate = () => dateNow().toISOString();

export const utcDate = (value: number) => date(value).toUTCString();

export const toSeconds = (ms: number) => Math.round(ms / 1000);

export const flattenObject = <T extends object>(
  obj: T = {} as T,
  prefix?: string
) =>
  objectKeys(obj).reduce((acc, k) => {
    const pre = prefix?.length ? `${prefix}.` : "";
    if (
      isObject(obj[k as keyof T]) &&
      objectKeys(obj[k as keyof T] || {}).length > 0
    )
      Object.assign(acc, flattenObject(obj[k as keyof T] as T, pre + k));
    else acc[pre + k] = obj[k as keyof T];
    return acc;
  }, {} as Record<string, unknown>);

export const tryParse = <T>(stringified: string) => {
  try {
    // try to unstringify a found value
    return JSON.parse(stringified || "") as T;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    return stringified as T | undefined;
  }
};

/** Iterate over each key in the source object and check if it exists in the obj object and has the same value */
export const objectMatches = <T extends object, S extends object>(
  obj?: T,
  source?: S
) =>
  isObject(obj) &&
  isObject(source) &&
  Object.keys(source).every(
    (key) =>
      // eslint-disable-next-line no-prototype-builtins
      obj.hasOwnProperty(key) &&
      (obj[key as keyof T] as string) === source[key as keyof S]
    // Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === source[key]
  );

export const trimToLower = (val: string | number | boolean) =>
  `${val}`.trim().toLowerCase();

export const isArray = (arr: unknown): arr is Array<unknown> =>
  Array.isArray(arr);
export const isNullOrUndefined = (val: unknown): val is null | undefined =>
  val === null || typeof val === "undefined";
export const isNumber = (val: unknown): val is number =>
  typeof val === "number";
export const isObject = (val: unknown) => !!val && typeof val === "object";
export const isSessionStore = (
  store: unknown
): store is IPersonalizationSessionStore => isObject(store) && "cpid" in store;
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

export const objectKeys = Object.keys;
export const objectFromEntries = Object.fromEntries;
export const stringify = JSON.stringify;
