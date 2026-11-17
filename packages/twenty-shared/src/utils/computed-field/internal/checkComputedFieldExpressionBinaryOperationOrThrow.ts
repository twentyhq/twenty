import { COMPUTED_FIELD_EXPRESSION_ORDERED_VALUE_TYPES } from '@/constants/ComputedFieldExpressionOrderedValueTypes';
import { type ComputedFieldExpressionBinaryOperator } from '@/types/ComputedFieldExpressionBinaryOperator';
import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { toComputedFieldExpressionDateOperandOrThrow } from '@/utils/computed-field/internal/toComputedFieldExpressionDateOperandOrThrow';
import { unifyComputedFieldExpressionOperandsOrThrow } from '@/utils/computed-field/internal/unifyComputedFieldExpressionOperandsOrThrow';
import { isDefined } from '@/utils/validation/isDefined';

type Operands = {
  left: TypedComputedFieldExpressionNode;
  right: TypedComputedFieldExpressionNode;
};

type CheckOperandsOrThrow = (
  args: Operands & { usage: string },
) => Operands & { type: ComputedFieldValueType };

const { NUMBER, TEXT, BOOLEAN, DATE, DATE_TIME } = FieldMetadataType;

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
    const { type, unify } = unifyComputedFieldExpressionOperandsOrThrow({
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

    return { left: unify(left), right: unify(right), type: BOOLEAN };
  };

// One IN list converts every item the same way, so it can only match "==" item by item when the items share a date kind
const assertDateMembershipComparesEachItemAsEqualityOrThrow = ({
  left,
  items,
  usage,
}: {
  left: TypedComputedFieldExpressionNode;
  items: TypedComputedFieldExpressionNode[];
  usage: string;
}): void => {
  if (left.type !== DATE_TIME) {
    return;
  }

  const itemTypes = items.map((item) =>
    item.kind === 'textLiteral'
      ? toComputedFieldExpressionDateOperandOrThrow({ operand: item, usage })
          .type
      : item.type,
  );

  if (itemTypes.includes(DATE) && itemTypes.includes(DATE_TIME)) {
    throw new ComputedFieldExpressionError(
      `${usage} cannot check a date and time against both dates and dates and times; split it into separate "in" checks`,
    );
  }
};

const listing: CheckOperandsOrThrow = ({ left, right, usage }) => {
  if (right.kind !== 'list' || right.items.length === 0) {
    throw new ComputedFieldExpressionError(
      '"in" must be followed by a non-empty list, such as [1, 2]',
    );
  }

  const { type, unify } = unifyComputedFieldExpressionOperandsOrThrow({
    operands: [left, ...right.items],
    usage,
    isComparison: true,
  });

  assertDateMembershipComparesEachItemAsEqualityOrThrow({
    left,
    items: right.items,
    usage,
  });

  return {
    left: unify(left),
    right: { ...right, items: right.items.map(unify), type },
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
