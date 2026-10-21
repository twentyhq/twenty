import { validationRuleNullPlaceholders } from '@/utils/validation-rule/validationRuleValueRegistry';
import { isDefined } from '@/utils/validation/isDefined';

export const isValidationRuleValueDefined = (
  value: unknown,
): value is NonNullable<unknown> =>
  isDefined(value) &&
  !(typeof value === 'object' && validationRuleNullPlaceholders.has(value));
