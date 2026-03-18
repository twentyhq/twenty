import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { Parser } from 'expr-eval-fork';

import { isDefined } from '../validation/isDefined';

import { safeGetNestedProperty } from './safeGetNestedProperty';

type ArrayMethod = 'every' | 'some';

const createArrayPropCheck = (
  method: ArrayMethod,
  predicate: (value: unknown) => boolean,
) => {
  return (array: unknown, prop: string) => {
    if (!isNonEmptyArray(array)) {
      return false;
    }

    return array[method]((item) =>
      predicate(safeGetNestedProperty(item, prop)),
    );
  };
};

const createArrayPropValueCheck = (
  method: ArrayMethod,
  predicate: (value: unknown, target: unknown) => boolean,
) => {
  return (array: unknown, prop: string, value: unknown) => {
    if (!isNonEmptyArray(array)) {
      return false;
    }

    return array[method]((item) =>
      predicate(safeGetNestedProperty(item, prop), value),
    );
  };
};

export const conditionalAvailabilityParser = new Parser();

conditionalAvailabilityParser.functions.isDefined = (value: unknown) =>
  isDefined(value);

conditionalAvailabilityParser.functions.isNonEmptyString = (value: unknown) =>
  isNonEmptyString(value);

conditionalAvailabilityParser.functions.includes = (
  array: unknown,
  value: unknown,
) => Array.isArray(array) && array.includes(value);

conditionalAvailabilityParser.functions.arrayLength = (value: unknown) =>
  Array.isArray(value) ? value.length : 0;

conditionalAvailabilityParser.functions.every = createArrayPropCheck(
  'every',
  Boolean,
);

conditionalAvailabilityParser.functions.everyDefined = createArrayPropCheck(
  'every',
  isDefined,
);

conditionalAvailabilityParser.functions.some = createArrayPropCheck(
  'some',
  Boolean,
);

conditionalAvailabilityParser.functions.someDefined = createArrayPropCheck(
  'some',
  isDefined,
);

conditionalAvailabilityParser.functions.someNonEmptyString =
  createArrayPropCheck('some', isNonEmptyString);

conditionalAvailabilityParser.functions.none = createArrayPropCheck(
  'every',
  (value) => !Boolean(value),
);

conditionalAvailabilityParser.functions.noneDefined = createArrayPropCheck(
  'every',
  (value) => !isDefined(value),
);

conditionalAvailabilityParser.functions.everyEquals = createArrayPropValueCheck(
  'every',
  (a, b) => a === b,
);

conditionalAvailabilityParser.functions.someEquals = createArrayPropValueCheck(
  'some',
  (a, b) => a === b,
);

conditionalAvailabilityParser.functions.noneEquals = createArrayPropValueCheck(
  'every',
  (a, b) => a !== b,
);

conditionalAvailabilityParser.functions.includesEvery =
  createArrayPropValueCheck(
    'every',
    (array, value) => Array.isArray(array) && array.includes(value),
  );

conditionalAvailabilityParser.functions.includesSome =
  createArrayPropValueCheck(
    'some',
    (array, value) => Array.isArray(array) && array.includes(value),
  );

conditionalAvailabilityParser.functions.includesNone =
  createArrayPropValueCheck(
    'every',
    (array, value) => Array.isArray(array) && !array.includes(value),
  );
