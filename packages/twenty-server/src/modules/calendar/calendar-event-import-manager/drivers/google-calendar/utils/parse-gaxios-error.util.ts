import { GaxiosError } from 'gaxios';

import {
  CalendarEventError,
  CalendarEventErrorCode,
} from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-error.type';

export const parseGaxiosError = (error: GaxiosError): CalendarEventError => {
  const { code } = error;

  switch (code) {
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
    case 'ERR_NETWORK':
      return {
        code: CalendarEventErrorCode.TEMPORARY_ERROR,
        message: error.message,
      };

    default:
      return {
        code: CalendarEventErrorCode.UNKNOWN,
        message: error.message,
      };
  }
};
