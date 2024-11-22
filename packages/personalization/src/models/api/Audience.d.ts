export interface IAudience {
  id: string;
  name: string;
  description: string;
  conditions: Conditions;
  version: IAudienceVersion;
}

export type Conditions =
  | {
      and: ConditionsAnd[];
    }
  | {
      or: ConditionsOr[];
    };

export type ConditionsAnd = Condition | Conditions;
export type ConditionsOr = Condition | Conditions;

export interface Condition {
  type: "audience" | "signal";
  id: string;
}

export interface IAudienceVersion {
  created: Date;
  createdBy: string;
  modified: Date;
  modifiedBy: string;
}
