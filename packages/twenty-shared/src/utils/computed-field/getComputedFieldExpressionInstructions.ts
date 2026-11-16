import { type ComputedFieldExpressionInstruction } from '@/types/ComputedFieldExpressionInstruction';
import { parseComputedFieldExpression } from '@/utils/computed-field/parseComputedFieldExpression';

export const getComputedFieldExpressionInstructions = (
  expression: string,
): ComputedFieldExpressionInstruction[] =>
  parseComputedFieldExpression(expression).tokens;
