import { isNonEmptyString, isString } from '@sniptt/guards';

import { addToExpressionDate } from '@/utils/expression-date/addToExpressionDate';
import { computeExpressionDateDifference } from '@/utils/expression-date/computeExpressionDateDifference';
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
  isInRelativeDateRange: {
    signature: 'isInRelativeDateRange(date, direction, amount, unit)',
    evaluate: isValidationRuleDateInRelativeRange,
  },
} as const;
