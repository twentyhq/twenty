import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { assertComputedFieldExpressionTypeOrThrow } from '@/utils/computed-field/internal/assertComputedFieldExpressionTypeOrThrow';
import { formatExpressionDate } from '@/utils/expression-date/formatExpressionDate';
import { isExpressionDateInSupportedRange } from '@/utils/expression-date/isExpressionDateInSupportedRange';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';
import { isDefined } from '@/utils/validation/isDefined';

// A text literal is read as rules read it and kept normalized, since Postgres rejects some forms Temporal reads
export const toComputedFieldExpressionDateOperandOrThrow = ({
  operand,
  usage,
}: {
  operand: TypedComputedFieldExpressionNode;
  usage: string;
}): TypedComputedFieldExpressionNode => {
  if (operand.kind !== 'textLiteral') {
    assertComputedFieldExpressionTypeOrThrow({
      type: operand.type,
      allowedTypes: [FieldMetadataType.DATE, FieldMetadataType.DATE_TIME],
      usage,
    });

    return operand;
  }

  const expressionDate = parseExpressionDate(operand.value);

  if (
    !isDefined(expressionDate) ||
    !isExpressionDateInSupportedRange(expressionDate)
  ) {
    throw new ComputedFieldExpressionError(
      `${usage} cannot read "${operand.value}" as a date such as '2030-01-31'`,
    );
  }

  return {
    ...operand,
    value: formatExpressionDate(expressionDate),
    type: expressionDate.isDateOnly
      ? FieldMetadataType.DATE
      : FieldMetadataType.DATE_TIME,
  };
};
