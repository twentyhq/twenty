import { isNonEmptyString } from '@sniptt/guards';
import { type EvaluationContext, Parser } from 'expr-eval';

import { isDefined } from '../validation/isDefined';

const BLOCKED_PROPERTY_NAMES = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

const safeGetNestedProperty = (obj: unknown, path: string): unknown => {
  if (typeof path !== 'string') return undefined;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (!isDefined(current) || typeof current !== 'object') return undefined;
    if (BLOCKED_PROPERTY_NAMES.has(part)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
};

const parser = new Parser();

parser.functions.isDefined = (value: unknown) => isDefined(value);
parser.functions.isNonEmptyString = (value: unknown) => isNonEmptyString(value);
parser.functions.includes = (array: unknown, value: unknown) =>
  Array.isArray(array) && array.includes(value);

parser.functions.every = (array: unknown, prop: string) => {
  if (!Array.isArray(array)) return false;
  return array.every((item) => !!safeGetNestedProperty(item, prop));
};

parser.functions.everyDefined = (array: unknown, prop: string) => {
  if (!Array.isArray(array)) return false;
  return array.every((item) => isDefined(safeGetNestedProperty(item, prop)));
};

parser.functions.everyEquals = (
  array: unknown,
  prop: string,
  value: unknown,
) => {
  if (!Array.isArray(array)) return false;
  return array.every(
    (item) => safeGetNestedProperty(item, prop) === value,
  );
};

parser.functions.some = (array: unknown, prop: string) => {
  if (!Array.isArray(array)) return false;
  return array.some((item) => !!safeGetNestedProperty(item, prop));
};

parser.functions.someDefined = (array: unknown, prop: string) => {
  if (!Array.isArray(array)) return false;
  return array.some((item) => isDefined(safeGetNestedProperty(item, prop)));
};

parser.functions.someEquals = (
  array: unknown,
  prop: string,
  value: unknown,
) => {
  if (!Array.isArray(array)) return false;
  return array.some(
    (item) => safeGetNestedProperty(item, prop) === value,
  );
};

parser.functions.none = (array: unknown, prop: string) => {
  if (!Array.isArray(array)) return false;
  return array.every((item) => !safeGetNestedProperty(item, prop));
};

parser.functions.noneDefined = (array: unknown, prop: string) => {
  if (!Array.isArray(array)) return false;
  return array.every(
    (item) => !isDefined(safeGetNestedProperty(item, prop)),
  );
};

parser.functions.noneEquals = (
  array: unknown,
  prop: string,
  value: unknown,
) => {
  if (!Array.isArray(array)) return false;
  return array.every(
    (item) => safeGetNestedProperty(item, prop) !== value,
  );
};

parser.functions.someNonEmptyString = (array: unknown, prop: string) => {
  if (!Array.isArray(array)) return false;
  return array.some((item) =>
    isNonEmptyString(safeGetNestedProperty(item, prop)),
  );
};

parser.functions.includesEvery = (
  array: unknown,
  prop: string,
  value: unknown,
) => {
  if (!Array.isArray(array)) return false;
  return array.every((item) => {
    const arr = safeGetNestedProperty(item, prop);
    return Array.isArray(arr) && arr.includes(value);
  });
};

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
