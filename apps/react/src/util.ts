import {
  Condition,
  Conditions,
  IPersonalizationStore,
  PersonalizationContext,
  Store,
  Where,
  WhereCriteria,
} from "@contensis/personalization";

const store = new Store({ persist: true });

export const recalculateSignals = (
  context: PersonalizationContext,
  state: IPersonalizationStore
) => {
  store.set(state);

  // // Trigger a new pageView in the context to force signal and audience recalculation
  // context.pageView();

  // Hack the context by setting the CalculatedSignals to null
  // in the pageViews array for this (last) route/pageView
  // and then manually call the compute method
  context.pageViews[context.pageViews.length - 1][2] = null;
  context.compute();
};

export type ConditionData =
  | (Condition & {
      logic: string;
    })
  | (WhereCriteria & {
      logic: string;
    });

export const mapConditions = <
  TConditions extends Conditions | Where,
  TData extends ConditionData
>(
  where?: TConditions,
  conditions: TData[] = [],
  prefix = ""
) => {
  if (!where) return [];
  if ("and" in where) {
    for (const and of where.and) {
      if ("and" in and || "or" in and) {
        conditions.push(...mapConditions(and, conditions, `${prefix}.`));
      } else if ("not" in and) {
        conditions.push({
          logic: `${prefix}and.not`,
          ...and.not,
        } as never);
      } else {
        conditions.push({
          logic: `${prefix}and`,
          ...and,
        } as never);
      }
    }
  }
  if ("or" in where) {
    for (const or of where.or) {
      if ("and" in or || "or" in or) {
        conditions.push(...mapConditions(or, conditions, `${prefix}.`));
      } else if ("not" in or) {
        conditions.push({
          logic: `${prefix}or.not`,
          ...or.not,
        } as never);
      } else {
        conditions.push({
          logic: `${prefix}or`,
          ...or,
        } as never);
      }
    }
  }
  return conditions;
};
