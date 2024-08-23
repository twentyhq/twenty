import { GaxiosError } from 'gaxios';

import {
  CalendarEventError,
  CalendarExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/exceptions/calendar.exception';

export const parseGaxiosError = (error: GaxiosError): CalendarEventError => {
  const { code } = error;

  switch (code) {
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
    case 'ERR_NETWORK':
      return {
        code: CalendarExceptionCode.TEMPORARY_ERROR,
        message: error.message,
      };

    default:
      return {
        code: CalendarExceptionCode.UNKNOWN,
        message: error.message,
      };
  }
};
