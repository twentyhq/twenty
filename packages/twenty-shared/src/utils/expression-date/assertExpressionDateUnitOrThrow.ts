import { EXPRESSION_DATE_UNITS } from '@/constants/ExpressionDateUnits';
import { type ExpressionDateUnit } from '@/types/ExpressionDateUnit';
import { CustomError } from '@/utils/errors/CustomError';
import { getExpressionDateLiteralErrorMessage } from '@/utils/expression-date/getExpressionDateLiteralErrorMessage';
import { isExpressionDateUnit } from '@/utils/expression-date/isExpressionDateUnit';

export const assertExpressionDateUnitOrThrow: (
  unit: unknown,
) => asserts unit is ExpressionDateUnit = (unit) => {
  if (!isExpressionDateUnit(unit)) {
    throw new CustomError(
      getExpressionDateLiteralErrorMessage({
        value: unit,
        kind: 'unit',
        allowedValues: EXPRESSION_DATE_UNITS,
      }),
      'INVALID_DATE_UNIT',
    );
  }
};
