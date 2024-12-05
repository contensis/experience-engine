export interface ISignal {
  id: string;
  name: string;
  minMatches: number;
  where: Where;
  version: IAudienceVersion;
}

export type Where = WhereAnd | WhereOr;

export interface WhereAnd {
  and: (WhereCriteria | WhereNot)[];
}
export interface WhereOr {
  or: (WhereCriteria | WhereNot)[];
}
export interface WhereNot {
  not: WhereCriteria;
}

export interface WhereCriteria {
  attribute: string;
  contains?: string;
  equals?: string;
  exists?: boolean;
  in?: string[];
  lessThan?: number;
  matchesRegex?: string;
  greaterThan?: number;
  startsWith?: string;
}

