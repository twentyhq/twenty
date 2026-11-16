import { COMPUTED_FIELD_EXPRESSION_BINARY_OPERATORS } from '@/constants/ComputedFieldExpressionBinaryOperators';
import { type ComputedFieldExpressionBinaryOperator } from '@/types/ComputedFieldExpressionBinaryOperator';

const BINARY_OPERATORS: readonly string[] =
  COMPUTED_FIELD_EXPRESSION_BINARY_OPERATORS;

export const isComputedFieldExpressionBinaryOperator = (
  operator: string,
): operator is ComputedFieldExpressionBinaryOperator =>
  BINARY_OPERATORS.includes(operator);
