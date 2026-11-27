import { VALIDATION_RULE_FUNCTIONS } from '@/constants/ValidationRuleFunctions';
import { type ValidationRuleFunctionName } from '@/types/ValidationRuleFunctionName';

export const isValidationRuleFunctionName = (
  name: string,
): name is ValidationRuleFunctionName => name in VALIDATION_RULE_FUNCTIONS;
