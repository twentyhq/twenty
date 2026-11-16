import { type COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES } from '@/constants/ComputedFieldExpressionFunctionNames';

export type ComputedFieldExpressionFunctionName =
  (typeof COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES)[number];
