import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from '@/constants/ValidationRulePreviousVariableName';

export const isValidationRulePreviousValuePath = (path: string): boolean =>
  path.startsWith(`${VALIDATION_RULE_PREVIOUS_VARIABLE_NAME}.`);
