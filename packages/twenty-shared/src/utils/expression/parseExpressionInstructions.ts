import { type ExpressionInstruction } from '@/types/ExpressionInstruction';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';

export const parseExpressionInstructions = (
  expression: string,
): ExpressionInstruction[] => parseValidationRuleExpression(expression).tokens;
