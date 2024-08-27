import { GaxiosError } from 'gaxios';

import {
  CalendarDriverException,
  CalendarDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-driver.exception';

export const parseGaxiosError = (
  error: GaxiosError,
): CalendarDriverException => {
  const { code } = error;

  switch (code) {
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
    case 'ERR_NETWORK':
      return new CalendarDriverException(
        error.message,
        CalendarDriverExceptionCode.TEMPORARY_ERROR,
      );

    default:
      return new CalendarDriverException(
        error.message,
        CalendarDriverExceptionCode.UNKNOWN,
      );
  }
};
