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
  type: ComputedFieldValueType | undefined;
  unify: (
    operand: TypedComputedFieldExpressionNode,
  ) => TypedComputedFieldExpressionNode;
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

    return { type: contextType, unify: (operand) => operand };
  }

  const type = getUnifiedDateType({
    dateTypes: operands.map(
      (operand) =>
        toComputedFieldExpressionDateOperandOrThrow({ operand, usage }).type,
    ),
    isComparison,
  });

  return {
    type,
    unify: (operand) => {
      const dateOperand = toComputedFieldExpressionDateOperandOrThrow({
        operand,
        usage,
      });

      return isDefined(dateOperand.type) && dateOperand.type !== type
        ? { kind: 'dateConversion', operand: dateOperand, type }
        : dateOperand;
    },
  };
};
