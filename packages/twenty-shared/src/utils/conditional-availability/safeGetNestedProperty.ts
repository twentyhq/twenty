import { isObject, isString } from '@sniptt/guards';

import { isDefined } from '../validation/isDefined';

const BLOCKED_PROPERTY_NAMES = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

export const safeGetNestedProperty = (
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

    if (
      BLOCKED_PROPERTY_NAMES.has(part) ||
      !Object.prototype.hasOwnProperty.call(currentObject, part)
    ) {
      return undefined;
    }

    currentObject = (currentObject as Record<string, unknown>)[part];
  }

  return currentObject;
};
