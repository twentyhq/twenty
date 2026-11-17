import { EXPRESSION_DATE_UNITS } from '@/constants/ExpressionDateUnits';
import { type ExpressionDateUnit } from '@/types/ExpressionDateUnit';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { readComputedFieldExpressionDateLiteralOrThrow } from '@/utils/computed-field/internal/readComputedFieldExpressionDateLiteralOrThrow';
import { isExpressionDateUnit } from '@/utils/expression-date/isExpressionDateUnit';

export const readComputedFieldExpressionDateUnitOrThrow = ({
  operand,
  usage,
}: {
  operand: TypedComputedFieldExpressionNode | undefined;
  usage: string;
}): ExpressionDateUnit =>
  readComputedFieldExpressionDateLiteralOrThrow({
    operand,
    usage,
    kind: 'unit',
    allowedValues: EXPRESSION_DATE_UNITS,
    isAllowedValue: isExpressionDateUnit,
  });
