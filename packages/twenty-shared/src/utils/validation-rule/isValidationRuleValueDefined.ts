import { validationRuleNullPlaceholders } from '@/utils/validation-rule/validationRuleValueRegistry';

export const isValidationRuleValueDefined = (value: unknown): boolean =>
  value !== null &&
  value !== undefined &&
  !(typeof value === 'object' && validationRuleNullPlaceholders.has(value));
