import { isDefined } from '@ui/utilities/utils/isDefined';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import { DatePickerException } from './DatePickerException';

import { DATE_PICKER_CONSTANTS } from './datePickerConstants';

const DATE_PICKER_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_PICKER_DATE_STRING_LENGTH = 10;

export const parseDatePickerDateOrThrow = (value: string): Date => {
  const dateParts = value.match(DATE_PICKER_DATE_PATTERN);

  if (
    !isDefined(dateParts) ||
    value.length !== DATE_PICKER_DATE_STRING_LENGTH
  ) {
    throw new DatePickerException({
      message: doNotTranslate('Calendar dates must use the YYYY-MM-DD format.'),
    });
  }

  const [, yearString, monthString, dayString] = dateParts;
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const date = new Date(0);

  date.setUTCFullYear(year, month - 1, day);

  const isSupportedDate =
    year >= DATE_PICKER_CONSTANTS.MIN_YEAR &&
    year <= DATE_PICKER_CONSTANTS.MAX_YEAR &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isSupportedDate) {
    throw new DatePickerException({
      message: doNotTranslate(
        'Calendar dates must be valid dates in years 0001 through 9999.',
      ),
    });
  }

  return date;
};
