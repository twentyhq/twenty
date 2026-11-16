import { COMPUTED_FIELD_EXPRESSION_ORDERED_VALUE_TYPES } from '@/constants/ComputedFieldExpressionOrderedValueTypes';
import { type ComputedFieldExpressionBinaryOperator } from '@/types/ComputedFieldExpressionBinaryOperator';
import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { unifyComputedFieldExpressionOperandsOrThrow } from '@/utils/computed-field/internal/unifyComputedFieldExpressionOperandsOrThrow';
import { isDefined } from '@/utils/validation/isDefined';

type Operands = {
  left: TypedComputedFieldExpressionNode;
  right: TypedComputedFieldExpressionNode;
};

type CheckOperandsOrThrow = (
  args: Operands & { usage: string },
) => Operands & { type: ComputedFieldValueType };

const { NUMBER, TEXT, BOOLEAN } = FieldMetadataType;

const takingOnly =
  (type: ComputedFieldValueType): CheckOperandsOrThrow =>
  ({ left, right, usage }) => {
    for (const operand of [left, right]) {
      assertComputedFieldExpressionTypeOrThrow({
        type: operand.type,
        allowedTypes: [type],
        usage,
      });
    }

    return { left, right, type };
  };

const comparing =
  (comparableTypes?: ComputedFieldValueType[]): CheckOperandsOrThrow =>
  ({ left, right, usage }) => {
    const {
      operands: [unifiedLeft = left, unifiedRight = right],
      type,
    } = unifyComputedFieldExpressionOperandsOrThrow({
      operands: [left, right],
      usage,
      isComparison: true,
    });

    if (isDefined(comparableTypes)) {
      assertComputedFieldExpressionTypeOrThrow({
        type,
        allowedTypes: comparableTypes,
        usage,
      });
    }

    return { left: unifiedLeft, right: unifiedRight, type: BOOLEAN };
  };

const listing: CheckOperandsOrThrow = ({ left, right, usage }) => {
  if (right.kind !== 'list' || right.items.length === 0) {
    throw new ComputedFieldExpressionError(
      '"in" must be followed by a non-empty list, such as [1, 2]',
    );
  }

  const {
    operands: [unifiedLeft = left, ...items],
    type,
  } = unifyComputedFieldExpressionOperandsOrThrow({
    operands: [left, ...right.items],
    usage,
    isComparison: true,
  });

  return {
    left: unifiedLeft,
    right: { ...right, items, type },
    type: BOOLEAN,
  };
};

const CHECK_OPERANDS_OR_THROW_BY_OPERATOR: Record<
  ComputedFieldExpressionBinaryOperator,
  CheckOperandsOrThrow
> = {
  '+': takingOnly(NUMBER),
  '-': takingOnly(NUMBER),
  '*': takingOnly(NUMBER),
  '/': takingOnly(NUMBER),
  '%': takingOnly(NUMBER),
  '==': comparing(),
  '!=': comparing(),
  '<': comparing(COMPUTED_FIELD_EXPRESSION_ORDERED_VALUE_TYPES),
  '<=': comparing(COMPUTED_FIELD_EXPRESSION_ORDERED_VALUE_TYPES),
  '>': comparing(COMPUTED_FIELD_EXPRESSION_ORDERED_VALUE_TYPES),
  '>=': comparing(COMPUTED_FIELD_EXPRESSION_ORDERED_VALUE_TYPES),
  and: takingOnly(BOOLEAN),
  or: takingOnly(BOOLEAN),
  '||': ({ left, right }) => ({ left, right, type: TEXT }),
  in: listing,
};

export const checkComputedFieldExpressionBinaryOperationOrThrow = ({
  operator,
  left,
  right,
}: Operands & {
  operator: ComputedFieldExpressionBinaryOperator;
}): Operands & { type: ComputedFieldValueType } =>
  CHECK_OPERANDS_OR_THROW_BY_OPERATOR[operator]({
    left,
    right,
    usage: `"${operator}"`,
  });
