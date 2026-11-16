import { type Temporal } from 'temporal-polyfill';

import { type ExpressionDateUnit } from '@/types/ExpressionDateUnit';
import { isDefined } from '@/utils/validation/isDefined';

import { assertExpressionDateUnitOrThrow } from '@/utils/expression-date/assertExpressionDateUnitOrThrow';
import { formatExpressionDate } from '@/utils/expression-date/formatExpressionDate';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';

const truncatePlainDate = ({
  date,
  unit,
}: {
  date: Temporal.PlainDate;
  unit: Exclude<ExpressionDateUnit, 'MINUTE' | 'HOUR' | 'DAY'>;
}): Temporal.PlainDate => {
  switch (unit) {
    case 'WEEK':
      return date.subtract({ days: date.dayOfWeek - 1 });
    case 'MONTH':
      return date.with({ day: 1 });
    case 'QUARTER':
      return date.with({
        month: Math.floor((date.month - 1) / 3) * 3 + 1,
        day: 1,
      });
    case 'YEAR':
      return date.with({ month: 1, day: 1 });
  }
};

export const truncateExpressionDate = (
  value: unknown,
  unit: unknown,
): string | null => {
  assertExpressionDateUnitOrThrow(unit);

  const expressionDate = parseExpressionDate(value);

  if (!isDefined(expressionDate)) {
    return null;
  }

  if (expressionDate.isDateOnly) {
    return formatExpressionDate(
      unit === 'MINUTE' || unit === 'HOUR' || unit === 'DAY'
        ? expressionDate
        : {
            isDateOnly: true,
            date: truncatePlainDate({ date: expressionDate.date, unit }),
          },
    );
  }

  const { dateTime } = expressionDate;

  switch (unit) {
    case 'MINUTE':
    case 'HOUR':
      return formatExpressionDate({
        isDateOnly: false,
        dateTime: dateTime.round({
          smallestUnit: unit === 'MINUTE' ? 'minute' : 'hour',
          roundingMode: 'trunc',
        }),
      });
    case 'DAY':
      return formatExpressionDate({
        isDateOnly: false,
        dateTime: dateTime.startOfDay(),
      });
    default:
      return formatExpressionDate({
        isDateOnly: false,
        dateTime: truncatePlainDate({
          date: dateTime.toPlainDate(),
          unit,
        }).toZonedDateTime('UTC'),
      });
  }
};
