import { isNonEmptyString, isString } from '@sniptt/guards';

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
} as const;
