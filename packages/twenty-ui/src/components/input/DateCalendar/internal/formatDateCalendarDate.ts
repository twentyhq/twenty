import { isInteger } from '@sniptt/guards';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import { DATE_CALENDAR_CONSTANTS } from './dateCalendarConstants';

const DATE_CALENDAR_DATE_STRING_LENGTH = 10;

export const formatDateCalendarDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const isSupportedYear =
    isInteger(year) &&
    year >= DATE_CALENDAR_CONSTANTS.MIN_YEAR &&
    year <= DATE_CALENDAR_CONSTANTS.MAX_YEAR;

  if (!isSupportedYear) {
    throw new RangeError(
      doNotTranslate(
        'Calendar dates must be valid dates in years 0001 through 9999.',
      ),
    );
  }

  return date.toISOString().slice(0, DATE_CALENDAR_DATE_STRING_LENGTH);
};
