export interface ISignal {
  id: string;
  name: string;
  minMatches: number;
  where: Where;
  version?: IAudienceVersion;
}

export type Where = WhereAnd | WhereOr;

export interface WhereAnd {
  and: (WhereCriteria | WhereNotCriteria | Where)[];
}
export interface WhereOr {
  or: (WhereCriteria | WhereNotCriteria | Where)[];
}
export interface WhereNotCriteria {
  not: WhereCriteria;
}

export type WhereCriteria =
  | WhereBetween
  | WhereContains
  | WhereEndsWith
  | WhereEqualTo
  | WhereExists
  | WhereGreaterThan
  | WhereGreaterThanOrEqualTo
  | WhereIn
  | WhereInRange
  | WhereLessThan
  | WhereLessThanOrEqualTo
  | WhereMatchesRegex
  | WhereStartsWith;

export interface WhereBetween {
  attribute: string;
  between: [number, number] | [string, string];
}
export interface WhereContains {
  attribute: string;
  contains: string;
}
export interface WhereEndsWith {
  attribute: string;
  endsWith: string;
}
export interface WhereEqualTo {
  attribute: string;
  equalTo: string;
}
export interface WhereExists {
  attribute: string;
  exists: boolean;
}
export interface WhereGreaterThan {
  attribute: string;
  greaterThan: number;
}
export interface WhereGreaterThanOrEqualTo {
  attribute: string;
  greaterThanOrEqualTo: number;
}
export interface WhereIn {
  attribute: string;
  in: string[];
}
/** Excusively for location.ip is a subnet range */
export interface WhereInRange {
  attribute: string;
  inRange: string;
}
export interface WhereLessThan {
  attribute: string;
  lessThan: number;
}
export interface WhereLessThanOrEqualTo {
  attribute: string;
  lessThanOrEqualTo: number;
}
export interface WhereMatchesRegex {
  attribute: string;
  matchesRegex: string;
}
export interface WhereStartsWith {
  attribute: string;
  startsWith: string;
}

// export type WhereOpKeys =
//   | keyof WhereContains
//   | keyof WhereEqualTo
//   | keyof WhereExists
//   | keyof WhereGreaterThan
//   | keyof WhereIn
//   | keyof WhereLessThan
//   | keyof WhereMatchesRegex
//   | keyof WhereStartsWith;

export type WhereAttribute =
  | "cookie"
  | "cookie.*"
  | "page.url"
  | "page.path"
  | "page.querystring"
  | "page.queryParams.*"
  | "page.domain"
  | "page.subdomain"
  | "page.baseUrl"
  | "referrer.url"
  | "referrer.path"
  | "referrer.querystring"
  | "referrer.queryParams.*"
  | "referrer.domain"
  | "referrer.subdomain"
  | "referrer.baseUrl";
