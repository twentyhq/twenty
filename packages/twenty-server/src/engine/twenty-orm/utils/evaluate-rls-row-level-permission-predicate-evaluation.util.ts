/* @license Enterprise */

import {
  type RawJsonFilter,
  type SelectFilter,
  type StringFilter,
  type UUIDFilter,
  type UUIDFilterValue,
} from 'twenty-shared/types';
import {
  isDefined,
  isMatchingRawJsonFilter,
  isMatchingSelectFilter,
  isMatchingStringFilter,
  isMatchingUUIDFilter,
} from 'twenty-shared/utils';

export type RLSPredicateEvaluation = 'invalid' | boolean;

export const combineAndResults = (
  results: RLSPredicateEvaluation[],
): RLSPredicateEvaluation => {
  if (results.length === 0) {
    return true;
  }

  if (results.some((result) => result === 'invalid')) {
    return 'invalid';
  }

  return results.every((result) => result === true);
};

export const combineOrResults = (
  results: RLSPredicateEvaluation[],
): RLSPredicateEvaluation => {
  if (results.length === 0) {
    return true;
  }

  if (results.some((result) => result === 'invalid')) {
    return 'invalid';
  }

  return results.some((result) => result === true);
};

export const evaluateFieldMatchResult = (
  evaluation: () => boolean,
): RLSPredicateEvaluation => {
  try {
    return evaluation();
  } catch {
    return 'invalid';
  }
};

export const hasOnlyAllowedDefinedFilterKeys = <
  T extends Record<string, unknown>,
>(
  filter: T,
  keys: readonly (keyof T)[],
): boolean => {
  const filterKeys = Object.keys(filter);

  if (filterKeys.length === 0) {
    return false;
  }

  return (
    filterKeys.every((key) => keys.includes(key as keyof T)) &&
    keys.some((key) => filter[key] !== undefined)
  );
};

export const evaluateCompositeSubFieldMatch = ({
  subFieldFilter,
  subFieldValue,
}: {
  subFieldFilter: StringFilter | RawJsonFilter | SelectFilter | UUIDFilter;
  subFieldValue: unknown;
}): boolean => {
  if (
    isDefined((subFieldFilter as RawJsonFilter).like) ||
    isDefined((subFieldFilter as RawJsonFilter).is)
  ) {
    return isMatchingRawJsonFilter({
      rawJsonFilter: subFieldFilter as RawJsonFilter,
      value: subFieldValue as string,
    });
  }

  if (isDefined((subFieldFilter as SelectFilter).eq)) {
    return isMatchingSelectFilter({
      selectFilter: subFieldFilter as SelectFilter,
      value: subFieldValue as string,
    });
  }

  if (
    isDefined((subFieldFilter as UUIDFilter).eq) ||
    isDefined((subFieldFilter as UUIDFilter).is)
  ) {
    return isMatchingUUIDFilter({
      uuidFilter: subFieldFilter as UUIDFilter,
      value: subFieldValue as UUIDFilterValue,
    });
  }

  return isMatchingStringFilter({
    stringFilter: subFieldFilter as StringFilter,
    value: subFieldValue as string,
  });
};
