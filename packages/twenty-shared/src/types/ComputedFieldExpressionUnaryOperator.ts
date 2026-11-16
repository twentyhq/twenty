import { type COMPUTED_FIELD_EXPRESSION_UNARY_OPERATORS } from '@/constants/ComputedFieldExpressionUnaryOperators';

export type ComputedFieldExpressionUnaryOperator =
  (typeof COMPUTED_FIELD_EXPRESSION_UNARY_OPERATORS)[number];
