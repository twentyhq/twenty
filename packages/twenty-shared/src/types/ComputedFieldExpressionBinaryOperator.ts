import { type COMPUTED_FIELD_EXPRESSION_BINARY_OPERATORS } from '@/constants/ComputedFieldExpressionBinaryOperators';

export type ComputedFieldExpressionBinaryOperator =
  (typeof COMPUTED_FIELD_EXPRESSION_BINARY_OPERATORS)[number];
