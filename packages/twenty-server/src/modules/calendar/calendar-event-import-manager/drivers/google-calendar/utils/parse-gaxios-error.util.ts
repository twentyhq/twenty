import { GaxiosError } from 'gaxios';

import {
  CalendarException,
  CalendarExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/exceptions/calendar.exception';

export const parseGaxiosError = (error: GaxiosError): CalendarException => {
  const { code } = error;

  switch (code) {
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
    case 'ERR_NETWORK':
      return new CalendarException(
        error.message,
        CalendarExceptionCode.TEMPORARY_ERROR,
      );

    default:
      return new CalendarException(
        error.message,
        CalendarExceptionCode.UNKNOWN,
      );
  }
};
