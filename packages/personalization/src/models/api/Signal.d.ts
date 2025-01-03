export interface ISignal {
  id: string;
  name: string;
  minMatches: number;
  where: Where;
  version: IAudienceVersion;
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

export interface WhereCriteria {
  attribute: string;
  contains?: string;
  equalTo?: string;
  exists?: boolean;
  in?: string[];
  lessThan?: number;
  matchesRegex?: string;
  greaterThan?: number;
  startsWith?: string;
}
