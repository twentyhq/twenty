import { isString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';

import { type ExpressionDate } from '@/types/ExpressionDate';
import { isDateWithoutTime } from '@/utils/date/isDateWithoutTime';

export const parseExpressionDate = (value: unknown): ExpressionDate | null => {
  if (!isString(value)) {
    return null;
  }

  try {
    if (isDateWithoutTime(value)) {
      return { isDateOnly: true, date: Temporal.PlainDate.from(value) };
    }

    return {
      isDateOnly: false,
      dateTime: Temporal.Instant.from(value).toZonedDateTimeISO('UTC'),
    };
  } catch {
    return null;
  }
};
