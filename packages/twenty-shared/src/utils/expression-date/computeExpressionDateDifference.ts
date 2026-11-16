import { isDefined } from '@/utils/validation/isDefined';

import { assertExpressionDateUnitOrThrow } from '@/utils/expression-date/assertExpressionDateUnitOrThrow';
import { countExpressionCalendarMonths } from '@/utils/expression-date/countExpressionCalendarMonths';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';
import { toExpressionDateTimeInUtc } from '@/utils/expression-date/toExpressionDateTimeInUtc';
import { truncateTowardZero } from '@/utils/expression-date/truncateTowardZero';

const MILLISECONDS_BY_ELAPSED_UNIT = { MINUTE: 60_000, HOUR: 3_600_000 };

export const computeExpressionDateDifference = (
  from: unknown,
  to: unknown,
  unit: unknown,
): number | null => {
  assertExpressionDateUnitOrThrow(unit);

  const start = parseExpressionDate(from);
  const end = parseExpressionDate(to);

  if (!isDefined(start) || !isDefined(end)) {
    return null;
  }

  const startDateTime = toExpressionDateTimeInUtc(start);
  const endDateTime = toExpressionDateTimeInUtc(end);

  switch (unit) {
    case 'MINUTE':
    case 'HOUR':
      return truncateTowardZero(
        (endDateTime.epochMilliseconds - startDateTime.epochMilliseconds) /
          MILLISECONDS_BY_ELAPSED_UNIT[unit],
      );
    case 'DAY':
    case 'WEEK': {
      const days = startDateTime
        .toPlainDate()
        .until(endDateTime.toPlainDate(), { largestUnit: 'days' }).days;

      return unit === 'DAY' ? days : truncateTowardZero(days / 7);
    }
    case 'MONTH':
    case 'QUARTER':
    case 'YEAR': {
      const months = countExpressionCalendarMonths({
        from: startDateTime.toPlainDate(),
        to: endDateTime.toPlainDate(),
      });

      return truncateTowardZero(
        months / { MONTH: 1, QUARTER: 3, YEAR: 12 }[unit],
      );
    }
  }
};
