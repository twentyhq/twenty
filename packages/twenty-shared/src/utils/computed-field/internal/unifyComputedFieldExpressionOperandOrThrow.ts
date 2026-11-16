import { isValid, parseISO } from 'date-fns';

import { type ComputedFieldValueType } from '@/types/ComputedFieldValueType';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type TypedComputedFieldExpressionNode } from '@/types/TypedComputedFieldExpressionNode';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { isDefined } from '@/utils/validation/isDefined';

const ISO_DATE_LITERAL = /^\d{4}-\d{2}-\d{2}([T ].+)?$/;

const isDateType = (type: ComputedFieldValueType | undefined): boolean =>
  type === FieldMetadataType.DATE || type === FieldMetadataType.DATE_TIME;

// A text literal next to a date is read as a date, and a date compares with a date and time
export const unifyComputedFieldExpressionOperandOrThrow = ({
  operand,
  type,
  usage,
}: {
  operand: TypedComputedFieldExpressionNode;
  type: ComputedFieldValueType | undefined;
  usage: string;
}): TypedComputedFieldExpressionNode => {
  if (operand.kind === 'textLiteral' && isDateType(type)) {
    // Postgres would fail the cast on every read, so a text that is not a date is refused when saved
    if (
      !ISO_DATE_LITERAL.test(operand.value) ||
      !isValid(parseISO(operand.value))
    ) {
      throw new ComputedFieldExpressionError(
        `${usage} compares a date with '${operand.value}', which is not a date such as '2030-01-31'`,
      );
    }

    return { ...operand, type };
  }

  if (
    isDefined(type) &&
    isDefined(operand.type) &&
    operand.type !== type &&
    !(isDateType(type) && isDateType(operand.type))
  ) {
    throw new ComputedFieldExpressionError(
      `${usage} cannot combine ${type.toLowerCase()} and ${operand.type.toLowerCase()}`,
    );
  }

  return operand;
};
