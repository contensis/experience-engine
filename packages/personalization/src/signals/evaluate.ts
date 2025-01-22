import { SignalValue, WhereCriteria } from "../models";
import {
  isArray,
  isNullOrUndefined,
  isNumber,
  isString,
  isUndefined,
  trimToLower,
} from "../util";

const CONTAINS = "contains";
const EQUAL_TO = "equalTo";
const IN = "in";
const EXISTS = "exists";
const GREATER_THAN = "greaterThan";
const LESS_THAN = "lessThan";
const MATCHES_REGEX = "matchesRegex";
const STARTS_WITH = "startsWith";

export const EvaluateSignal = <T extends SignalValue | SignalValue[]>(
  criteria: WhereCriteria,
  value: T
) => {
  /** Evaluate a single criteria from an array of resolved values and return a boolean match */
  const process = (value: SignalValue | SignalValue[]) => {
    let match = false;
    if (Array.isArray(value)) {
      for (const item of value) {
        match = evaluate(item);
        if (match) break;
      }
    } else {
      match = evaluate(value);
    }
    return match;
  };

  /** Evaluate a single criteria with a resolved value and return a boolean match */
  const evaluate = (value: SignalValue) => {
    // check for known operator types
    if (CONTAINS in criteria && isString(value))
      return value.includes(criteria[CONTAINS]);

    if (EQUAL_TO in criteria && !isUndefined(value))
      if (isString(value))
        return trimToLower(value) === trimToLower(criteria[EQUAL_TO]);
      else return value == (criteria[EQUAL_TO] as unknown);

    if (IN in criteria && isArray(criteria[IN]) && !isNullOrUndefined(value))
      return criteria[IN].map((ic) => trimToLower(ic)).includes(
        trimToLower(value)
      );

    if (EXISTS in criteria) return !isNullOrUndefined(value);

    if (GREATER_THAN in criteria && isNumber(value))
      return value > criteria[GREATER_THAN];

    if (LESS_THAN in criteria && isNumber(value))
      return value < criteria[LESS_THAN];

    if (MATCHES_REGEX in criteria && !isUndefined(value))
      return new RegExp(criteria[MATCHES_REGEX]).test(`${value}`);

    if (STARTS_WITH in criteria && isString(value))
      return trimToLower(value).startsWith(trimToLower(criteria[STARTS_WITH]));

    return false;
  };

  return process(value);
};
