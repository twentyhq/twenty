import { type Temporal } from 'temporal-polyfill';

import { type ExpressionDate } from '@/types/ExpressionDate';

export const toExpressionDateTimeInUtc = (
  expressionDate: ExpressionDate,
): Temporal.ZonedDateTime =>
  expressionDate.isDateOnly
    ? expressionDate.date.toZonedDateTime('UTC')
    : expressionDate.dateTime;
