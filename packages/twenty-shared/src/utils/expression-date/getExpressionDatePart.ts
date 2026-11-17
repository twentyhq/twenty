import { isDefined } from '@/utils/validation/isDefined';

import { assertExpressionDatePartOrThrow } from '@/utils/expression-date/assertExpressionDatePartOrThrow';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';
import { toExpressionDateTimeInUtc } from '@/utils/expression-date/toExpressionDateTimeInUtc';

// In UTC. WEEK is the ISO week number and DAY_OF_WEEK runs from 1 (Monday) to 7 (Sunday)
export const getExpressionDatePart = (
  value: unknown,
  part: unknown,
): number | null => {
  assertExpressionDatePartOrThrow(part);

  const expressionDate = parseExpressionDate(value);

  if (!isDefined(expressionDate)) {
    return null;
  }

  const dateTime = toExpressionDateTimeInUtc(expressionDate);

  switch (part) {
    case 'YEAR':
      return dateTime.year;
    case 'QUARTER':
      return Math.floor((dateTime.month - 1) / 3) + 1;
    case 'MONTH':
      return dateTime.month;
    case 'WEEK':
      return dateTime.weekOfYear ?? null;
    case 'DAY':
      return dateTime.day;
    case 'DAY_OF_WEEK':
      return dateTime.dayOfWeek;
    case 'HOUR':
      return dateTime.hour;
    case 'MINUTE':
      return dateTime.minute;
  }
};
