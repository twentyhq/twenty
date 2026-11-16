import { COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES } from '@/constants/ComputedFieldExpressionFunctionNames';
import { type ComputedFieldExpressionFunctionName } from '@/types/ComputedFieldExpressionFunctionName';

const FUNCTION_NAMES: readonly string[] =
  COMPUTED_FIELD_EXPRESSION_FUNCTION_NAMES;

export const isComputedFieldExpressionFunctionName = (
  name: string,
): name is ComputedFieldExpressionFunctionName => FUNCTION_NAMES.includes(name);
