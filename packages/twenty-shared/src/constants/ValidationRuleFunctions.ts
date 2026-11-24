import { isNonEmptyString, isNumber, isString } from '@sniptt/guards';

import { addToExpressionDate } from '@/utils/expression-date/addToExpressionDate';
import { computeExpressionDateDifference } from '@/utils/expression-date/computeExpressionDateDifference';
import { reduceExpressionNumbers } from '@/utils/expression/reduceExpressionNumbers';
import { getExpressionDatePart } from '@/utils/expression-date/getExpressionDatePart';
import { truncateExpressionDate } from '@/utils/expression-date/truncateExpressionDate';
import { isValidationRuleDateInRelativeRange } from '@/utils/validation-rule/isValidationRuleDateInRelativeRange';
import { isValidationRuleValueDefined } from '@/utils/validation-rule/isValidationRuleValueDefined';
import { isValidationRuleValueEmpty } from '@/utils/validation-rule/isValidationRuleValueEmpty';

export const VALIDATION_RULE_FUNCTIONS = {
  isDefined: {
    signature: 'isDefined(value)',
    evaluate: isValidationRuleValueDefined,
  },
  isEmpty: {
    signature: 'isEmpty(value)',
    evaluate: isValidationRuleValueEmpty,
  },
  isNonEmptyString: {
    signature: 'isNonEmptyString(value)',
    evaluate: (value: unknown) => isNonEmptyString(value),
  },
  includes: {
    signature: 'includes(listOrText, value)',
    evaluate: (container: unknown, value: unknown) =>
      Array.isArray(container)
        ? container.includes(value)
        : isString(container) && isString(value) && container.includes(value),
  },
  arrayLength: {
    signature: 'arrayLength(list)',
    evaluate: (value: unknown) => (Array.isArray(value) ? value.length : 0),
  },
  dateDiff: {
    signature: 'dateDiff(from, to, unit)',
    evaluate: computeExpressionDateDifference,
  },
  dateAdd: {
    signature: 'dateAdd(date, amount, unit)',
    evaluate: addToExpressionDate,
  },
  dateTrunc: {
    signature: 'dateTrunc(date, unit)',
    evaluate: truncateExpressionDate,
  },
  datePart: {
    signature: 'datePart(date, part)',
    evaluate: getExpressionDatePart,
  },
  if: {
    signature: 'if(condition, valueIfTrue, valueIfFalse)',
    evaluate: (
      condition: unknown,
      valueIfTrue: unknown,
      valueIfFalse: unknown,
    ) => (condition === true ? valueIfTrue : valueIfFalse),
  },
  coalesce: {
    signature: 'coalesce(value, ...fallbacks)',
    evaluate: (...values: unknown[]) =>
      values.find(isValidationRuleValueDefined) ?? null,
  },
  concat: {
    signature: 'concat(value, ...values)',
    evaluate: (...values: unknown[]) =>
      values.filter(isValidationRuleValueDefined).join(''),
  },
  lower: {
    signature: 'lower(text)',
    evaluate: (text: unknown) => (isString(text) ? text.toLowerCase() : null),
  },
  upper: {
    signature: 'upper(text)',
    evaluate: (text: unknown) => (isString(text) ? text.toUpperCase() : null),
  },
  min: {
    signature: 'min(number, ...numbers)',
    evaluate: (...values: unknown[]) =>
      reduceExpressionNumbers({ values, reduce: Math.min }),
  },
  max: {
    signature: 'max(number, ...numbers)',
    evaluate: (...values: unknown[]) =>
      reduceExpressionNumbers({ values, reduce: Math.max }),
  },
  roundTo: {
    signature: 'roundTo(number, decimals)',
    evaluate: (value: unknown, decimals: unknown) =>
      isNumber(value) && isNumber(decimals)
        ? Number(value.toFixed(Math.min(Math.max(Math.trunc(decimals), 0), 20)))
        : null,
  },
  isInRelativeDateRange: {
    signature: 'isInRelativeDateRange(date, direction, amount, unit)',
    evaluate: isValidationRuleDateInRelativeRange,
  },
} as const;
