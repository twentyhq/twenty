import {
  isNonEmptyArray,
  isNonEmptyString,
  isObject,
  isString,
} from '@sniptt/guards';
import { type EvaluationContext, Parser } from 'expr-eval-fork';

import { isDefined } from '../validation/isDefined';

const BLOCKED_PROPERTY_NAMES = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

const safeGetNestedProperty = (
  objectToEvaluate: unknown,
  path: string,
): unknown => {
  if (!isString(path)) {
    return undefined;
  }

  const parts = path.split('.');

  let currentObject: unknown = objectToEvaluate;

  for (const part of parts) {
    if (!isDefined(currentObject) || !isObject(currentObject)) {
      return undefined;
    }

    if (BLOCKED_PROPERTY_NAMES.has(part)) {
      return undefined;
    }

    currentObject = (currentObject as Record<string, unknown>)[part];
  }

  return currentObject;
};

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

const parser = new Parser();

parser.functions.isDefined = (value: unknown) => isDefined(value);
parser.functions.isNonEmptyString = (value: unknown) => isNonEmptyString(value);
parser.functions.includes = (array: unknown, value: unknown) =>
  Array.isArray(array) && array.includes(value);
parser.functions.arrayLength = (value: unknown) =>
  Array.isArray(value) ? value.length : 0;

parser.functions.every = createArrayPropCheck('every', Boolean);
parser.functions.everyDefined = createArrayPropCheck('every', isDefined);
parser.functions.some = createArrayPropCheck('some', Boolean);
parser.functions.someDefined = createArrayPropCheck('some', isDefined);
parser.functions.someNonEmptyString = createArrayPropCheck(
  'some',
  isNonEmptyString,
);
parser.functions.none = createArrayPropCheck(
  'every',
  (value) => !Boolean(value),
);
parser.functions.noneDefined = createArrayPropCheck(
  'every',
  (value) => !isDefined(value),
);

parser.functions.everyEquals = createArrayPropValueCheck(
  'every',
  (a, b) => a === b,
);
parser.functions.someEquals = createArrayPropValueCheck(
  'some',
  (a, b) => a === b,
);
parser.functions.noneEquals = createArrayPropValueCheck(
  'every',
  (a, b) => a !== b,
);

parser.functions.includesEvery = createArrayPropValueCheck(
  'every',
  (array, value) => Array.isArray(array) && array.includes(value),
);
parser.functions.includesSome = createArrayPropValueCheck(
  'some',
  (array, value) => Array.isArray(array) && array.includes(value),
);
parser.functions.includesNone = createArrayPropValueCheck(
  'every',
  (array, value) => Array.isArray(array) && !array.includes(value),
);

export const evaluateConditionalAvailabilityExpression = (
  expression: string | null | undefined,
  context: EvaluationContext,
): boolean => {
  if (!isNonEmptyString(expression)) {
    return true;
  }

  try {
    const parsed = parser.parse(expression);

    return parsed.evaluate(context) === true;
  } catch {
    return false;
  }
};
