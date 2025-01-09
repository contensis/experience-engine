import { isObject, isSSR, now, tryParse, utcDate } from "../util";

export type StoreConstructorArgs = { persist?: boolean; type?: Store["type"] };

export interface IStoreOptions {
  type?: Store["type"];
  key?: Store["key"];
}

export class Store {
  private key = "cp";
  // type: "localStorage" | "sessionStorage" | "cookie" = "localStorage";
  type: "localStorage" | "sessionStorage" | "c" = "localStorage";
  persist = true;

  /** Use sessionStorage or localStorage if persist is false or true (default: true) */
  constructor({ persist = true, type = "localStorage" }: StoreConstructorArgs) {
    this.persist = persist;
    this.type = type;

    if (type === "localStorage" && !persist) this.type = "sessionStorage";
  }

  get = <T = unknown>({
    type = this.type,
    key = this.key,
  }: IStoreOptions = {}): T | undefined => {
    if (isSSR()) return undefined;

    const stringified =
      type === "c"
        ? document.cookie
            .split(";")
            .filter((cookie) => cookie.trim().startsWith(`${key}=`))
            .map((cookie) => cookie.trim().substring(key.length + 1))?.[0]
        : window[type].getItem(key);

    if (stringified) {
      return tryParse(stringified);
    }
  };

  getAll = ({ type = this.type }: IStoreOptions = {}): Storage | undefined => {
    if (isSSR()) return undefined;

    return type === "c"
      ? Object.fromEntries(
          document.cookie.split(";").map((cookie) => cookie.trim().split("="))
        )
      : window[type];
  };

  getString = ({ type = this.type }: IStoreOptions = {}): string => {
    if (isSSR()) return "";

    return type === "c" ? `${document.cookie}` : JSON.stringify(window[type]);
  };

  set = <T = unknown>(
    value: T,
    { type = this.type, key = this.key }: IStoreOptions = {}
  ) => {
    if (isSSR()) return undefined;

    const stringified = isObject(value) ? JSON.stringify(value) : value;

    if (type === "c") {
      const expires = now() + 30 * 24 * 60 * 60 * 1000;
      return (document.cookie = `${key}=${stringified};${
        this.persist ? `expires=${utcDate(expires)};` : ""
      }SameSite=Lax`);
    }

    return window[type].setItem(key, `${stringified}`);
  };

  clear = ({ type = this.type, key = this.key } = {}) => {
    if (isSSR()) return undefined;

    return type === "c"
      ? (document.cookie = `${key}=;expires=${utcDate(0)}`)
      : window[type].removeItem(key);
  };
}

export const cookieStore = new Store({ type: "c" });
