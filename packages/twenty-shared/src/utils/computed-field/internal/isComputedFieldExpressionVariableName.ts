import { COMPUTED_FIELD_EXPRESSION_VARIABLE_NAMES } from '@/constants/ComputedFieldExpressionVariableNames';
import { type ComputedFieldExpressionVariableName } from '@/types/ComputedFieldExpressionVariableName';

const VARIABLE_NAMES: readonly string[] =
  COMPUTED_FIELD_EXPRESSION_VARIABLE_NAMES;

export const isComputedFieldExpressionVariableName = (
  name: string,
): name is ComputedFieldExpressionVariableName => VARIABLE_NAMES.includes(name);
