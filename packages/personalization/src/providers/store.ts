import { isSSR, tryParse } from "../util";

export type StoreConstructorArgs = { persist?: boolean; type?: Store["type"] };

export interface IStoreOptions {
  type?: Store["type"];
  key?: Store["key"];
}

export class Store {
  private key = "cp";
  type: "localStorage" | "sessionStorage" | "cookie" = "localStorage";
  persist = true;

  /** Use sessionStorage or localStorage if persist is false or true (default: true) */
  constructor(
    { persist = true, type = "localStorage" }: StoreConstructorArgs = {
      persist: true,
      type: "localStorage",
    }
  ) {
    this.persist = persist;
    this.type = type;

    if (type === "localStorage" && !persist) this.type = "sessionStorage";
  }

  get = <T = unknown>({
    type = this.type,
    key = this.key,
  }: IStoreOptions = {}): T | undefined => {
    if (isSSR()) return undefined;

    let stringified: string | null = "";

    if (type === "cookie")
      stringified = document.cookie
        .split(";")
        .filter((cookie) => cookie.trim().startsWith(`${key}=`))
        .map((cookie) => cookie.trim().substring(key.length + 1))?.[0];
    else stringified = window[type].getItem(key);

    if (stringified) {
      return tryParse(stringified);
    }
  };

  getAll = ({ type = this.type }: IStoreOptions = {}): Storage | undefined => {
    if (isSSR()) return undefined;

    if (type === "cookie")
      return Object.fromEntries(
        document.cookie.split(";").map((cookie) => cookie.split("="))
      );
    return window[type];
  };

  getString = ({ type = this.type }: IStoreOptions = {}): string => {
    if (isSSR()) return "";

    if (type === "cookie") return document.cookie.toString();
    return JSON.stringify(window[type]);
  };

  set = <T = unknown>(
    value: T,
    { type = this.type, key = this.key }: IStoreOptions = {}
  ) => {
    if (isSSR()) return undefined;

    const stringified =
      value && typeof value === "object" ? JSON.stringify(value) : value;

    if (type === "cookie") {
      const expires = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      return (document.cookie = `${key}=${stringified};${
        this.persist ? `expires=${new Date(expires).toUTCString()};` : ""
      }SameSite=Lax`);
    }

    return window[type].setItem(key, `${stringified}`);
  };

  clear = ({ type = this.type, key = this.key } = {}) => {
    if (isSSR()) return undefined;

    if (type === "cookie")
      return (document.cookie = `${key}=;expires=${new Date(0).toUTCString()}`);
    return window[type].removeItem(key);
  };
}

export const cookieStore = new Store({ type: "cookie" });
