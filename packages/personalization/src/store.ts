import { isSSR, tryParse } from "./util";

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
    switch (type) {
      case "localStorage":
        stringified = localStorage.getItem(key);
        break;
      case "sessionStorage":
        stringified = sessionStorage.getItem(key);
        break;
      case "cookie":
        stringified = document.cookie
          .split(";")
          .filter((cookie) => cookie.trim().startsWith(`${key}=`))
          .map((cookie) => cookie.trim().substring(key.length + 1))?.[0];
        break;
      default:
        stringified = null;
    }

    if (stringified) {
      return tryParse(stringified);
    }
  };

  getAll = ({ type = this.type }: IStoreOptions = {}):
    | Record<string, unknown>
    | undefined => {
    if (isSSR()) return undefined;

    switch (type) {
      case "localStorage":
        return localStorage;
      case "sessionStorage":
        return sessionStorage;
      case "cookie":
        return Object.fromEntries(
          document.cookie.split(";").map((cookie) => cookie.split("="))
        );
      default:
        return {};
    }
  };

  set = <T = unknown>(
    value: T,
    { type = this.type, key = this.key }: IStoreOptions = {}
  ) => {
    if (isSSR()) return undefined;

    const stringified =
      value && typeof value === "object" ? JSON.stringify(value) : value;
    switch (type) {
      case "localStorage":
        return localStorage.setItem(key, `${stringified}`);
      case "sessionStorage":
        return sessionStorage.setItem(key, `${stringified}`);
      case "cookie": {
        const expires = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
        return (document.cookie = `${key}=${stringified};${
          this.persist ? `expires=${new Date(expires).toUTCString()};` : ""
        }SameSite=Lax`);
      }
      default:
        return undefined;
    }
  };

  clear = ({ type = this.type, key = this.key } = {}) => {
    if (isSSR()) return undefined;

    switch (type) {
      case "localStorage":
        return localStorage.removeItem(key);
      case "sessionStorage":
        return sessionStorage.removeItem(key);
      case "cookie": {
        return (document.cookie = `${key}=;expires=${new Date(
          0
        ).toUTCString()}`);
      }
      default:
        return null;
    }
  };
}

export const cookieStore = new Store({ type: "cookie" });
