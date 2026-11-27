import { isDefined } from '@/utils/validation/isDefined';

import { assertExpressionDateUnitOrThrow } from '@/utils/expression-date/assertExpressionDateUnitOrThrow';
import { formatExpressionDate } from '@/utils/expression-date/formatExpressionDate';
import { parseExpressionDate } from '@/utils/expression-date/parseExpressionDate';
import { toExpressionDateTimeInUtc } from '@/utils/expression-date/toExpressionDateTimeInUtc';
import { getPeriodStart } from '@/utils/filter/dates/utils/getPeriodStart';

export const truncateExpressionDate = (
  value: unknown,
  unit: unknown,
): string | null => {
  assertExpressionDateUnitOrThrow(unit);

  const expressionDate = parseExpressionDate(value);

  if (!isDefined(expressionDate)) {
    return null;
  }

  const dateTime = getPeriodStart(
    toExpressionDateTimeInUtc(expressionDate),
    unit,
  );

  return formatExpressionDate(
    expressionDate.isDateOnly
      ? { isDateOnly: true, date: dateTime.toPlainDate() }
      : { isDateOnly: false, dateTime },
  );
};
