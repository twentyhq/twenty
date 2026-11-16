import { isNumber } from '@sniptt/guards';
import { type Temporal } from 'temporal-polyfill';

import { type ExpressionDateUnit } from '@/types/ExpressionDateUnit';
import { isDefined } from '@/utils/validation/isDefined';

import { assertExpressionDateUnitOrThrow } from '@/utils/expression-date/assertExpressionDateUnitOrThrow';
import { formatExpressionDate } from '@/utils/expression-date/formatExpressionDate';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';
import { toExpressionDateTimeInUtc } from '@/utils/expression-date/toExpressionDateTimeInUtc';
import { truncateTowardZero } from '@/utils/expression-date/truncateTowardZero';

const toDuration = (
  amount: number,
  unit: ExpressionDateUnit,
): Temporal.DurationLike => {
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

// The amount is truncated toward zero; a month added to the 31st lands on the month's last day
export const addToExpressionDate = (
  value: unknown,
  amount: unknown,
  unit: unknown,
): string | null => {
  assertExpressionDateUnitOrThrow(unit);

  const expressionDate = parseExpressionDate(value);

  if (
    !isDefined(expressionDate) ||
    !isNumber(amount) ||
    !Number.isFinite(amount)
  ) {
    return null;
  }

  const duration = toDuration(truncateTowardZero(amount), unit);

  if (expressionDate.isDateOnly && unit !== 'MINUTE' && unit !== 'HOUR') {
    return formatExpressionDate({
      isDateOnly: true,
      date: expressionDate.date.add(duration),
    });
  }

  return formatExpressionDate({
    isDateOnly: false,
    dateTime: toExpressionDateTimeInUtc(expressionDate).add(duration),
  });
};
