import { ViewFilterOperand } from 'twenty-shared/types';
import { isVariableReference, resolveInput } from 'twenty-shared/utils';

const EMPTINESS_OPERAND_BY_OPERAND: Partial<
  Record<ViewFilterOperand, ViewFilterOperand>
> = {
  [ViewFilterOperand.IS]: ViewFilterOperand.IS_EMPTY,
  [ViewFilterOperand.IS_NOT]: ViewFilterOperand.IS_NOT_EMPTY,
  [ViewFilterOperand.CONTAINS]: ViewFilterOperand.IS_EMPTY,
  [ViewFilterOperand.DOES_NOT_CONTAIN]: ViewFilterOperand.IS_NOT_EMPTY,
};

export const resolveFilterValueAndOperand = ({
  value,
  operand,
  context,
}: {
  value: unknown;
  operand: ViewFilterOperand;
  context: Record<string, unknown>;
}): { value: unknown; operand: ViewFilterOperand } => {
  const resolvedValue = resolveInput(value, context);

  if (!isVariableReference(value) || resolvedValue !== null) {
    return { value: resolvedValue, operand };
  }

  return {
    value: resolvedValue,
    operand: EMPTINESS_OPERAND_BY_OPERAND[operand] ?? operand,
  };
};
