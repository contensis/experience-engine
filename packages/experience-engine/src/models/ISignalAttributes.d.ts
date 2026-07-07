import { SignalValue } from "./Signals";

export interface ISignalAttributes {
  "page.url": string;
  "page.path": string;
  "page.querystring": string;
  "page.queryParams": (key: string) => string | string[] | undefined;
  "page.domain": string;
  "page.subdomain": string;
  "page.baseUrl": string;
  "referrer.url"?: string;
  "referrer.path"?: string;
  "referrer.querystring"?: string;
  "referrer.queryParams": (key: string) => string | string[] | undefined;
  "referrer.domain"?: string;
  "referrer.subdomain"?: string;
  "referrer.baseUrl"?: string;
  cookie: string;
  "cookie.*": { [key: string]: string | string[] };
}

export interface IBrowserSignalAttributes {
  userAgent: string;
  language: string;
  platform: string;
  vendor: string;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  touchSupport: boolean;
  timezone: string;
  cookiesEnabled: boolean;
}

export interface ILocationSignalAttributes {
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
}

export interface ICustomAttributes {
  [key: string]: SignalValue | SignalValue[];
}

export interface IOverrideAttributes {
  [key: string]: SignalValue | SignalValue[];
}
