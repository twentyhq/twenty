import { type ExpressionDate } from '@/types/ExpressionDate';

import { toExpressionDateTimeInUtc } from '@/utils/expression-date/toExpressionDateTimeInUtc';

// Years 1 to 9999: Postgres reads them, and they keep a four-digit year in the ISO text
export const isExpressionDateInSupportedRange = (
  expressionDate: ExpressionDate,
): boolean => {
  const { year } = toExpressionDateTimeInUtc(expressionDate);

  return year >= 1 && year <= 9999;
};
