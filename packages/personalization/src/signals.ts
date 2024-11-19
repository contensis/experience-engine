import { cookieStore } from "./store";

export class UrlSignals {
  constructor(private url = new URL(window.location.href)) {}

  hostname = () => this.url.hostname;
  path = () => this.url.pathname;
  queryString = () => {
    const params = this.url.searchParams;

    params.sort();
    return Object.fromEntries(params.entries());
  };
}

export class Signals {
  static pageUrl = () => {
    const url = new URL(window.location.href);
    return url;
  };
  static url = new UrlSignals();
  static cookie = (name: string) => cookieStore.get({ key: name });
}

