import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { getComputedFieldExpressionUnifiedType } from '@/utils/computed-field/internal/getComputedFieldExpressionUnifiedType';
import { toComputedFieldExpressionDateOperandOrThrow } from '@/utils/computed-field/internal/toComputedFieldExpressionDateOperandOrThrow';
import { isDefined } from '@/utils/validation/isDefined';

const { DATE, DATE_TIME } = FieldMetadataType;

const getUnifiedDateType = ({
  dateTypes,
  isComparison,
}: {
  dateTypes: (ComputedFieldValueType | undefined)[];
  isComparison: boolean;
}): ComputedFieldValueType => {
  if (isComparison) {
    return dateTypes.includes(DATE) ? DATE : DATE_TIME;
  }

  return dateTypes.includes(DATE_TIME) ? DATE_TIME : DATE;
};

// A date next to a date and time: a comparison compares UTC days, as rules do; elsewhere the date widens to UTC midnight
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
  const type = getUnifiedDateType({
    dateTypes: dateOperands.map((operand) => operand.type),
    isComparison,
  });

  return {
    operands: dateOperands.map((operand): TypedComputedFieldExpressionNode =>
      isDefined(operand.type) && operand.type !== type
        ? { kind: 'dateConversion', operand, type }
        : operand,
    ),
    type,
  };
};
