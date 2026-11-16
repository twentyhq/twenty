import { isNumber } from '@sniptt/guards';
import { type Temporal } from 'temporal-polyfill';

import { type ExpressionDate } from '@/types/ExpressionDate';
import { type ExpressionDateUnit } from '@/types/ExpressionDateUnit';
import { isDefined } from '@/utils/validation/isDefined';

import { assertExpressionDateUnitOrThrow } from '@/utils/expression-date/assertExpressionDateUnitOrThrow';
import { formatExpressionDate } from '@/utils/expression-date/formatExpressionDate';
import { isExpressionDateInSupportedRange } from '@/utils/expression-date/isExpressionDateInSupportedRange';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';
import { toExpressionDateTimeInUtc } from '@/utils/expression-date/toExpressionDateTimeInUtc';
import { truncateTowardZero } from '@/utils/expression-date/truncateTowardZero';

const toDuration = ({
  amount,
  unit,
}: {
  amount: number;
  unit: ExpressionDateUnit;
}): Temporal.DurationLike => {
  switch (unit) {
    case 'MINUTE':
      return { minutes: amount };
    case 'HOUR':
      return { hours: amount };
    case 'DAY':
      return { days: amount };
    case 'WEEK':
      return { weeks: amount };
    case 'MONTH':
      return { months: amount };
    case 'QUARTER':
      return { months: amount * 3 };
    case 'YEAR':
      return { years: amount };
  }
};

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
    const duration = toDuration({ amount, unit });

    if (expressionDate.isDateOnly && unit !== 'MINUTE' && unit !== 'HOUR') {
      return { isDateOnly: true, date: expressionDate.date.add(duration) };
    }

    return {
      isDateOnly: false,
      dateTime: toExpressionDateTimeInUtc(expressionDate).add(duration),
    };
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
