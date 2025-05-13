import { IPersonalizationStore } from "../models";
import {
  isObject,
  isSSR,
  isString,
  now,
  objectFromEntriesPreserveMultiples,
  stringify,
  stringifyReplacer,
  tryParse,
  utcDate,
} from "../util";

const w = (isSSR() ? undefined : window) as Window & typeof globalThis;
const cookie = (
  set?: string
): typeof set extends string ? undefined : string => {
  if (isString(set)) document.cookie = set;
  return document.cookie;
};

export type StoreConstructorArgs = {
  key?: string;
  persist?: boolean;
  type?: Store["type"];
};

export interface IStoreOptions {
  type?: Store["type"];
  key?: Store["key"];
}

export class Store {
  // type: "localStorage" | "sessionStorage" | "cookie" = "localStorage";
  type: "localStorage" | "sessionStorage" | "c" = "localStorage";
  private key = "cp";
  #persist = true;

  /**
   * Store is an interface for persisting values or (stringifiable) objects for Personalization
   * Provide a key to maintain a particular store or omit the key to write to the default "cp" store
   * The store type can be set and used for sessionStorage or a cookie, localStorage is default
   * Use sessionStorage or localStorage if persist is false or true (default: true)
   */
  constructor({
    key,
    persist = true,
    type = "localStorage",
  }: StoreConstructorArgs) {
    this.#persist = persist;
    if (key) this.key = key;
    this.type = type === "localStorage" && !persist ? "sessionStorage" : type;
  }

  get = <T = unknown>({
    type = this.type,
    key = this.key,
  }: IStoreOptions = {}): T | undefined => {
    if (isSSR()) return undefined;

    const stringified =
      type === "c"
        ? cookie()
            .split(";")
            .filter((cookie) => cookie.trim().startsWith(`${key}=`))
            .map((cookie) => cookie.trim().substring(key.length + 1))?.[0]
        : w[type].getItem(key);

    if (stringified) {
      return tryParse(stringified);
    }
  };

  getAll: {
    (options?: { type?: "c" }):
      | { [key: string]: string | string[] }
      | undefined;
    (options?: { type?: "localStorage" | "sessionStorage" }):
      | Storage
      | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = ({ type = this.type }: IStoreOptions = {}): any => {
    if (isSSR()) return undefined;

    if (type === "c")
      return objectFromEntriesPreserveMultiples(
        cookie()
          .split(";")
          .map((cookie) => cookie.trim().split("=")) as [string, string][]
      );

    return w[type];
  };

  getString = ({ type = this.type }: IStoreOptions = {}): string => {
    if (isSSR()) return "";

    return type === "c" ? `${cookie()}` : stringify(w[type]);
  };

  set = <T = unknown>(
    value: T,
    { type = this.type, key = this.key }: IStoreOptions = {}
  ) => {
    if (isSSR()) return undefined;

    const stringified = (
      isObject(value) ? stringify(value, stringifyReplacer) : value
    ) as string;

    if (type === "c") {
      const expires = now() + 30 * 24 * 60 * 60 * 1000;
      return cookie(
        `${key}=${stringified};${
          this.#persist ? `expires=${utcDate(expires)};` : ""
        }SameSite=Lax`
      );
    }

    const maxSize = 1048576; // 1MiB 524288; //512KiB
    if (stringified.length > maxSize) {
      return this.#shrink(
        value as IPersonalizationStore,
        stringified.length,
        maxSize
      );
    }

    return w[type].setItem(key, `${stringified}`);
  };

  clear = ({ type = this.type, key = this.key } = {}) => {
    if (isSSR()) return undefined;

    return type === "c"
      ? cookie(`${key}=;expires=${utcDate(0)}`)
      : w[type].removeItem(key);
  };

  #shrink = (
    value: IPersonalizationStore,
    originalSize: number,
    targetSize: number,
    nuke = false
  ) => {
    value.signals.computed = undefined;
    if (!nuke) {
      // First pass, remove computed signals
      // limit signal matches to 10
      if (value.signals.matched)
        for (const [signal, matches] of Object.entries(
          value.signals.matched || {}
        )) {
          value.signals.matched[signal] = matches.slice(0, 9);
        }
    } else {
      // Final pass, clear all matches
      value.signals.matched = {};
    }
    const size = stringify(value, stringifyReplacer).length;
    if (size <= targetSize) {
      console.info(
        `[Store] shrunk from ${originalSize} to ${size}/${targetSize}`
      );
      this.set(value);
    } else if (!nuke) {
      // go for another pass
      this.#shrink(value, size, targetSize, true);
    } else if (nuke) {
      // still too big
      console.error(
        `[Store] failed to shrink below ${targetSize} bytes, shrunk from ${originalSize} to ${size}`,
        value
      );
    }
  };
}

export const cookieStore = new Store({ type: "c" });
