import { SignalValue, WhereCriteria } from "../models";
import {
  ipRangeCheck,
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

// operators added 01/2025
const ENDS_WITH = "endsWith";
const GREATER_THAN_OR_EQUAL = "greaterThanOrEqualTo";
const LESS_THAN_OR_EQUAL = "lessThanOrEqualTo";
const BETWEEN = "between";
const IN_RANGE = "inRange";

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
    if (BETWEEN in criteria && (isString(value) || isNumber(value)))
      return value >= criteria[BETWEEN][0] && value <= criteria[BETWEEN][1];

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

    if (IN_RANGE in criteria && isString(value))
      return ipRangeCheck(value, criteria[IN_RANGE]);

    if (EXISTS in criteria) return !isNullOrUndefined(value);

    if (GREATER_THAN in criteria && isNumber(value))
      return value > criteria[GREATER_THAN];

    if (GREATER_THAN_OR_EQUAL in criteria && isNumber(value))
      return value >= criteria[GREATER_THAN_OR_EQUAL];

    if (LESS_THAN in criteria && isNumber(value))
      return value < criteria[LESS_THAN];

    if (LESS_THAN_OR_EQUAL in criteria && isNumber(value))
      return value <= criteria[LESS_THAN_OR_EQUAL];

    if (MATCHES_REGEX in criteria && !isUndefined(value))
      return new RegExp(criteria[MATCHES_REGEX]).test(`${value}`);

    if (STARTS_WITH in criteria && isString(value))
      return trimToLower(value).startsWith(trimToLower(criteria[STARTS_WITH]));

    if (ENDS_WITH in criteria && isString(value))
      return trimToLower(value).endsWith(trimToLower(criteria[ENDS_WITH]));

    return false;
  };

  return process(value);
};
