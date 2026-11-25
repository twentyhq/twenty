import { isNonEmptyString, isNumber, isString } from '@sniptt/guards';

import { addToExpressionDate } from '@/utils/expression-date/addToExpressionDate';
import { computeExpressionDateDifference } from '@/utils/expression-date/computeExpressionDateDifference';
import { reduceExpressionNumbers } from '@/utils/expression/reduceExpressionNumbers';
import { roundExpressionNumber } from '@/utils/expression/roundExpressionNumber';
import { getExpressionDatePart } from '@/utils/expression-date/getExpressionDatePart';
import { truncateExpressionDate } from '@/utils/expression-date/truncateExpressionDate';
import { isValidationRuleDateInRelativeRange } from '@/utils/validation-rule/isValidationRuleDateInRelativeRange';
import { isValidationRuleValueDefined } from '@/utils/validation-rule/isValidationRuleValueDefined';
import { isValidationRuleValueEmpty } from '@/utils/validation-rule/isValidationRuleValueEmpty';

export const VALIDATION_RULE_FUNCTIONS = {
  isDefined: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    signature: 'isDefined(value)',
    evaluate: isValidationRuleValueDefined,
  },
  isEmpty: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    signature: 'isEmpty(value)',
    evaluate: isValidationRuleValueEmpty,
  },
  isNonEmptyString: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    signature: 'isNonEmptyString(value)',
    evaluate: (value: unknown) => isNonEmptyString(value),
  },
  includes: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    signature: 'includes(listOrText, value)',
    evaluate: (container: unknown, value: unknown) =>
      Array.isArray(container)
        ? container.includes(value)
        : isString(container) && isString(value) && container.includes(value),
  },
  arrayLength: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    signature: 'arrayLength(list)',
    evaluate: (value: unknown) => (Array.isArray(value) ? value.length : 0),
  },
  dateDiff: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    signature: 'dateDiff(from, to, unit)',
    evaluate: computeExpressionDateDifference,
  },
  dateAdd: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    signature: 'dateAdd(date, amount, unit)',
    evaluate: addToExpressionDate,
  },
  dateTrunc: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    signature: 'dateTrunc(date, unit)',
    evaluate: truncateExpressionDate,
  },
  datePart: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    signature: 'datePart(date, part)',
    evaluate: getExpressionDatePart,
  },
  if: {
    minimumArgumentCount: 3,
    maximumArgumentCount: 3,
    signature: 'if(condition, valueIfTrue, valueIfFalse)',
    evaluate: (
      condition: unknown,
      valueIfTrue: unknown,
      valueIfFalse: unknown,
    ) => (condition === true ? valueIfTrue : valueIfFalse),
  },
  coalesce: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    signature: 'coalesce(value, ...fallbacks)',
    evaluate: (...values: unknown[]) =>
      values.find(isValidationRuleValueDefined) ?? null,
  },
  concat: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    signature: 'concat(value, ...values)',
    evaluate: (...values: unknown[]) =>
      values.filter(isValidationRuleValueDefined).join(''),
  },
  lower: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    signature: 'lower(text)',
    evaluate: (text: unknown) => (isString(text) ? text.toLowerCase() : null),
  },
  upper: {
    minimumArgumentCount: 1,
    maximumArgumentCount: 1,
    signature: 'upper(text)',
    evaluate: (text: unknown) => (isString(text) ? text.toUpperCase() : null),
  },
  min: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    signature: 'min(number, ...numbers)',
    evaluate: (...values: unknown[]) =>
      reduceExpressionNumbers({ values, reduce: Math.min }),
  },
  max: {
    minimumArgumentCount: 1,
    maximumArgumentCount: Infinity,
    signature: 'max(number, ...numbers)',
    evaluate: (...values: unknown[]) =>
      reduceExpressionNumbers({ values, reduce: Math.max }),
  },
  roundTo: {
    minimumArgumentCount: 2,
    maximumArgumentCount: 2,
    signature: 'roundTo(number, decimals)',
    evaluate: (value: unknown, decimals: unknown) =>
      isNumber(value) && isNumber(decimals)
        ? roundExpressionNumber({
            value,
            decimals: Math.min(Math.max(Math.trunc(decimals), 0), 20),
          })
        : null,
  },
  isInRelativeDateRange: {
    minimumArgumentCount: 4,
    maximumArgumentCount: 4,
    signature: 'isInRelativeDateRange(date, direction, amount, unit)',
    evaluate: isValidationRuleDateInRelativeRange,
  },
} as const;
