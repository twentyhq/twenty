import { isNumber } from '@sniptt/guards';

import { type ExpressionDate } from '@/types/ExpressionDate';
import { type ExpressionDateUnit } from '@/types/ExpressionDateUnit';
import { isDefined } from '@/utils/validation/isDefined';

import { assertExpressionDateUnitOrThrow } from '@/utils/expression-date/assertExpressionDateUnitOrThrow';
import { formatExpressionDate } from '@/utils/expression-date/formatExpressionDate';
import { isExpressionDateInSupportedRange } from '@/utils/expression-date/isExpressionDateInSupportedRange';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';
import { toExpressionDateTimeInUtc } from '@/utils/expression-date/toExpressionDateTimeInUtc';
import { truncateTowardZero } from '@/utils/expression-date/truncateTowardZero';
import { addUnitToZonedDateTime } from '@/utils/filter/dates/utils/addUnitToZonedDateTime';

// Temporal throws a RangeError for an amount it cannot represent
const addDurationOrNull = ({
  expressionDate,
  amount,
  unit,
}: {
  expressionDate: ExpressionDate;
  amount: number;
  unit: ExpressionDateUnit;
}): ExpressionDate | null => {
  try {
    const dateTime = addUnitToZonedDateTime(
      toExpressionDateTimeInUtc(expressionDate),
      unit,
      amount,
    );

    return expressionDate.isDateOnly && unit !== 'MINUTE' && unit !== 'HOUR'
      ? { isDateOnly: true, date: dateTime.toPlainDate() }
      : { isDateOnly: false, dateTime };
  } catch (error) {
    if (error instanceof RangeError) {
      return null;
    }

    throw error;
  }
};

export const addToExpressionDate = (
  value: unknown,
  amount: unknown,
  unit: unknown,
): string | null => {
  assertExpressionDateUnitOrThrow(unit);

  const expressionDate = parseExpressionDate(value);

  if (
    !isDefined(expressionDate) ||
    !isExpressionDateInSupportedRange(expressionDate) ||
    !isNumber(amount) ||
    !Number.isFinite(amount)
  ) {
    return null;
  }

  const result = addDurationOrNull({
    expressionDate,
    amount: truncateTowardZero(amount),
    unit,
  });

  return isDefined(result) && isExpressionDateInSupportedRange(result)
    ? formatExpressionDate(result)
    : null;
};
