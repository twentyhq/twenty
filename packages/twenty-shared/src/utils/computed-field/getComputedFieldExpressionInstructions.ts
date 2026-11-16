import { parseComputedFieldExpression } from '@/utils/computed-field/parseComputedFieldExpression';

// One step of the parsed expression in postfix order; a nested expression holds its own instructions as value
export type ComputedFieldExpressionInstruction = {
  type: string;
  value: unknown;
};

export const getComputedFieldExpressionInstructions = (
  expression: string,
): ComputedFieldExpressionInstruction[] =>
  parseComputedFieldExpression(expression).tokens;
