import { EXPRESSION_DATE_PARTS } from '@/constants/ExpressionDateParts';
import { type ExpressionDatePart } from '@/types/ExpressionDatePart';
import { getExpressionDateLiteralErrorMessage } from '@/utils/expression-date/getExpressionDateLiteralErrorMessage';
import { isExpressionDatePart } from '@/utils/expression-date/isExpressionDatePart';

export const assertExpressionDatePartOrThrow: (
  part: unknown,
) => asserts part is ExpressionDatePart = (part) => {
  if (!isExpressionDatePart(part)) {
    throw new Error(
      getExpressionDateLiteralErrorMessage({
        value: part,
        kind: 'part',
        allowedValues: EXPRESSION_DATE_PARTS,
      }),
    );
  }
};
