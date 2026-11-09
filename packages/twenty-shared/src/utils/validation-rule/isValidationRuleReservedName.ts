import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from '@/constants/ValidationRulePreviousVariableName';
import { validationRuleParser } from '@/utils/validation-rule/validationRuleParser';

export const isValidationRuleReservedName = ({
  name,
  isMember,
}: {
  name: string;
  isMember: boolean;
}): boolean =>
  (!isMember &&
    (name === VALIDATION_RULE_NOW_VARIABLE_NAME ||
      name === VALIDATION_RULE_PREVIOUS_VARIABLE_NAME ||
      name in validationRuleParser.functions)) ||
  name in validationRuleParser.unaryOps ||
  name in validationRuleParser.binaryOps ||
  name in validationRuleParser.consts;
