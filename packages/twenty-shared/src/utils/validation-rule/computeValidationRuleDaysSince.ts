import { isString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';

import { parseToPlainDateOrThrow } from '@/utils/date/parseToPlainDateOrThrow';

// Whole UTC calendar days from the date to today, negative for a future date
export const computeValidationRuleDaysSince = (
  value: unknown,
): number | null => {
  if (!isString(value)) {
    return null;
  }

  try {
    const today = Temporal.Now.zonedDateTimeISO('UTC').toPlainDate();

    return parseToPlainDateOrThrow(value).until(today, { largestUnit: 'days' })
      .days;
  } catch {
    return null;
  }
};
