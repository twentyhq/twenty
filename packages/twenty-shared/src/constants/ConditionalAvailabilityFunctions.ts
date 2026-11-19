import { isNonEmptyString } from '@sniptt/guards';

import { createArrayPropCheck } from '@/utils/conditional-availability/createArrayPropCheck';
import { createArrayPropValueCheck } from '@/utils/conditional-availability/createArrayPropValueCheck';
import { isDefined } from '@/utils/validation/isDefined';

export const CONDITIONAL_AVAILABILITY_FUNCTIONS = {
  isDefined: {
    evaluate: (value: unknown) => isDefined(value),
  },
  isNonEmptyString: {
    evaluate: (value: unknown) => isNonEmptyString(value),
  },
  includes: {
    evaluate: (array: unknown, value: unknown) =>
      Array.isArray(array) && array.includes(value),
  },
  arrayLength: {
    evaluate: (value: unknown) => (Array.isArray(value) ? value.length : 0),
  },
  every: {
    evaluate: createArrayPropCheck('every', Boolean),
  },
  everyDefined: {
    evaluate: createArrayPropCheck('every', isDefined),
  },
  some: {
    evaluate: createArrayPropCheck('some', Boolean),
  },
  someDefined: {
    evaluate: createArrayPropCheck('some', isDefined),
  },
  someNonEmptyString: {
    evaluate: createArrayPropCheck('some', isNonEmptyString),
  },
  none: {
    evaluate: createArrayPropCheck('every', (value) => !Boolean(value)),
  },
  noneDefined: {
    evaluate: createArrayPropCheck('every', (value) => !isDefined(value)),
  },
  everyEquals: {
    evaluate: createArrayPropValueCheck(
      'every',
      (propertyValue, value) => propertyValue === value,
    ),
  },
  someEquals: {
    evaluate: createArrayPropValueCheck(
      'some',
      (propertyValue, value) => propertyValue === value,
    ),
  },
  noneEquals: {
    evaluate: createArrayPropValueCheck(
      'every',
      (propertyValue, value) => propertyValue !== value,
    ),
  },
  includesEvery: {
    evaluate: createArrayPropValueCheck(
      'every',
      (propertyValue, value) =>
        Array.isArray(propertyValue) && propertyValue.includes(value),
    ),
  },
  includesSome: {
    evaluate: createArrayPropValueCheck(
      'some',
      (propertyValue, value) =>
        Array.isArray(propertyValue) && propertyValue.includes(value),
    ),
  },
  includesNone: {
    evaluate: createArrayPropValueCheck(
      'every',
      (propertyValue, value) =>
        Array.isArray(propertyValue) && !propertyValue.includes(value),
    ),
  },
} as const;
