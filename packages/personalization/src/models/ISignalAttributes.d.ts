export interface ISignalAttributes {
  timestamp: number;
  pageUrl: string;
  "page.url": string;
  "page.path": string;
  "page.querystring": string;
  "page.queryParams.*": (key: string) => string[];
  // "page.queryParams.*": { [key: string]: string } = {};
  "page.domain": string;
  "page.subdomain": string;
  "page.baseUrl": string;
  "referrer.url"?: string;
  "referrer.path"?: string;
  "referrer.querystring"?: string;
  "referrer.queryParams.*": (key: string) => string[] | undefined;
  // "referrer.queryParams.*"?: { [key: string]: string } = {};
  "referrer.domain"?: string;
  "referrer.subdomain"?: string;
  "referrer.baseUrl"?: string;
  cookie: string;
  "cookie.*": { [key: string]: string };
}
