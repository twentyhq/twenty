import { isNonEmptyString } from '@sniptt/guards';

import { createArrayPropertyCheck } from '@/conditional-evaluation/common/utils/createArrayPropertyCheck';
import { isDefined } from '@/utils/validation/isDefined';

export const CONDITIONAL_EVALUATION_FUNCTIONS = {
  isDefined: (value: unknown) => isDefined(value),
  isNonEmptyString: (value: unknown) => isNonEmptyString(value),
  includes: (array: unknown, value: unknown) =>
    Array.isArray(array) && array.includes(value),
  arrayLength: (value: unknown) => (Array.isArray(value) ? value.length : 0),
  every: createArrayPropertyCheck('every', Boolean),
  everyDefined: createArrayPropertyCheck('every', isDefined),
  some: createArrayPropertyCheck('some', Boolean),
  someDefined: createArrayPropertyCheck('some', isDefined),
  someNonEmptyString: createArrayPropertyCheck('some', isNonEmptyString),
  none: createArrayPropertyCheck(
    'every',
    (propertyValue) => !Boolean(propertyValue),
  ),
  noneDefined: createArrayPropertyCheck(
    'every',
    (propertyValue) => !isDefined(propertyValue),
  ),
  everyEquals: createArrayPropertyCheck(
    'every',
    (propertyValue, value) => propertyValue === value,
  ),
  someEquals: createArrayPropertyCheck(
    'some',
    (propertyValue, value) => propertyValue === value,
  ),
  noneEquals: createArrayPropertyCheck(
    'every',
    (propertyValue, value) => propertyValue !== value,
  ),
  includesEvery: createArrayPropertyCheck(
    'every',
    (propertyValue, value) =>
      Array.isArray(propertyValue) && propertyValue.includes(value),
  ),
  includesSome: createArrayPropertyCheck(
    'some',
    (propertyValue, value) =>
      Array.isArray(propertyValue) && propertyValue.includes(value),
  ),
  includesNone: createArrayPropertyCheck(
    'every',
    (propertyValue, value) =>
      Array.isArray(propertyValue) && !propertyValue.includes(value),
  ),
} as const;
