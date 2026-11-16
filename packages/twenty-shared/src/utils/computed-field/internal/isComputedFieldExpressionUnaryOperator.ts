import { COMPUTED_FIELD_EXPRESSION_UNARY_OPERATORS } from '@/constants/ComputedFieldExpressionUnaryOperators';
import { type ComputedFieldExpressionUnaryOperator } from '@/types/ComputedFieldExpressionUnaryOperator';

const UNARY_OPERATORS: readonly string[] =
  COMPUTED_FIELD_EXPRESSION_UNARY_OPERATORS;

export const isComputedFieldExpressionUnaryOperator = (
  operator: string,
): operator is ComputedFieldExpressionUnaryOperator =>
  UNARY_OPERATORS.includes(operator);
