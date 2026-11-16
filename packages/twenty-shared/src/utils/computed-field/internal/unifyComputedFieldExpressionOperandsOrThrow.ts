import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { getComputedFieldExpressionUnifiedType } from '@/utils/computed-field/internal/getComputedFieldExpressionUnifiedType';
import { toComputedFieldExpressionDateOperandOrThrow } from '@/utils/computed-field/internal/toComputedFieldExpressionDateOperandOrThrow';
import { isDefined } from '@/utils/validation/isDefined';

const { DATE, DATE_TIME } = FieldMetadataType;

// A text literal next to a date is read as a date. A comparison reads a date and a date and time as UTC days, as rules do;
// elsewhere a date is widened to UTC midnight so no time is dropped
export const unifyComputedFieldExpressionOperandsOrThrow = ({
  operands,
  usage,
  isComparison = false,
}: {
  operands: TypedComputedFieldExpressionNode[];
  usage: string;
  isComparison?: boolean;
}): {
  operands: TypedComputedFieldExpressionNode[];
  type: ComputedFieldValueType | undefined;
} => {
  const contextType = getComputedFieldExpressionUnifiedType(operands);

  if (contextType !== DATE && contextType !== DATE_TIME) {
    for (const operand of operands) {
      if (
        isDefined(contextType) &&
        isDefined(operand.type) &&
        operand.type !== contextType
      ) {
        throw new ComputedFieldExpressionError(
          `${usage} cannot combine ${contextType.toLowerCase()} and ${operand.type.toLowerCase()}`,
        );
      }
    }

    return { operands, type: contextType };
  }

  const dateOperands = operands.map((operand) =>
    toComputedFieldExpressionDateOperandOrThrow({ operand, usage }),
  );
  const dateTypes = dateOperands.map((operand) => operand.type);

  const type = isComparison
    ? dateTypes.includes(DATE)
      ? DATE
      : DATE_TIME
    : dateTypes.includes(DATE_TIME)
      ? DATE_TIME
      : DATE;

  return {
    operands: dateOperands.map((operand): TypedComputedFieldExpressionNode =>
      isDefined(operand.type) && operand.type !== type
        ? { kind: 'dateConversion', operand, type }
        : operand,
    ),
    type,
  };
};
