import { IPersonalizationStore } from "./models";

export const isSSR = () => typeof window === "undefined";

export const tryParse = <T>(stringified: string) => {
  try {
    // try to unstringify a found value
    return JSON.parse(stringified || "") as T;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    return stringified as T | undefined;
  }
};

export const isArray = (arr: unknown): arr is Array<unknown> =>
  Array.isArray(arr);
export const isNumber = (val: unknown): val is number =>
  typeof val === "number";
export const isStore = (store: unknown): store is IPersonalizationStore =>
  !!store && typeof store === "object" && "cpid" in store;
export const isString = (val: unknown): val is string =>
  typeof val === "string";
export const isUndefined = (val: unknown): val is undefined =>
  typeof val === "undefined";
