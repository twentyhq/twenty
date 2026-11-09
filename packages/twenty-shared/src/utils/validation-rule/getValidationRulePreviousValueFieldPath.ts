import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from '@/constants/ValidationRulePreviousVariableName';
import { isValidationRulePreviousValuePath } from '@/utils/validation-rule/isValidationRulePreviousValuePath';

export const getValidationRulePreviousValueFieldPath = (
  path: string,
): string | null =>
  isValidationRulePreviousValuePath(path)
    ? path.slice(VALIDATION_RULE_PREVIOUS_VARIABLE_NAME.length + 1)
    : null;
