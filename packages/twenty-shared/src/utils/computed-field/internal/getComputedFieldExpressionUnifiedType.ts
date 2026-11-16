import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { isDefined } from '@/utils/validation/isDefined';

// A text literal takes the type of what it stands next to, so it only gives the type when nothing else does
export const getComputedFieldExpressionUnifiedType = (
  operands: TypedComputedFieldExpressionNode[],
): ComputedFieldValueType | undefined =>
  operands.find(
    (operand) => isDefined(operand.type) && operand.kind !== 'textLiteral',
  )?.type ?? operands.find((operand) => isDefined(operand.type))?.type;
