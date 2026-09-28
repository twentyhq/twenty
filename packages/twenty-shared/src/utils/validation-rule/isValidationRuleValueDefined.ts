import { validationRuleNullPlaceholders } from '@/utils/validation-rule/validationRuleValueRegistry';
import { isDefined } from '@/utils/validation/isDefined';

export const isValidationRuleValueDefined = (value: unknown): boolean =>
  isDefined(value) &&
  !(typeof value === 'object' && validationRuleNullPlaceholders.has(value));
