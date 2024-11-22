export interface ISignal {
  id: string;
  name: string;
  minMatches: number;
  where: Where;
  version: IAudienceVersion;
}

export type Where = WhereAnd | WhereOr;

export interface WhereOr {
  or: WhereCriteria[];
}

export interface WhereAnd {
  and: WhereCriteria[];
}

export interface WhereCriteria {
  attribute: string;
  contains?: string;
  equals?: string;
  lessThan?: number;
  greaterThan?: number;
  startsWith?: string;
}
