import { EXPRESSION_DATE_PARTS } from '@/constants/ExpressionDateParts';
import { type ExpressionDatePart } from '@/types/ExpressionDatePart';
import { getExpressionDateLiteralErrorMessage } from '@/utils/expression-date/getExpressionDateLiteralErrorMessage';

export const assertExpressionDatePartOrThrow: (
  part: unknown,
) => asserts part is ExpressionDatePart = (part) => {
  if (!(EXPRESSION_DATE_PARTS as readonly unknown[]).includes(part)) {
    throw new Error(
      getExpressionDateLiteralErrorMessage({
        value: part,
        kind: 'part',
        allowedValues: EXPRESSION_DATE_PARTS,
      }),
    );
  }
};
