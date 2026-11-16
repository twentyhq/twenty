import { COMPUTED_FIELD_EXPRESSION_VARIABLE_NAMES } from '@/constants/ComputedFieldExpressionVariableNames';
import { parseComputedFieldExpression } from '@/utils/computed-field/parseComputedFieldExpression';

const VARIABLE_NAMES: readonly string[] = COMPUTED_FIELD_EXPRESSION_VARIABLE_NAMES;

// "amount.amountMicros" reads as ['amount', 'amountMicros']: a composite sub-field or a field of a to-one relation
export const getComputedFieldExpressionFieldPaths = (
  expression: string,
): string[][] =>
  parseComputedFieldExpression(expression)
    .variables({ withMembers: true })
    .filter((variable) => !VARIABLE_NAMES.includes(variable))
    .map((variable) => variable.split('.'));
