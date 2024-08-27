import { GaxiosError } from 'gaxios';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

export const parseGaxiosError = (
  error: GaxiosError,
): CalendarEventImportDriverException => {
  const { code } = error;

  switch (code) {
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ECONNABORTED':
    case 'ETIMEDOUT':
    case 'ERR_NETWORK':
      return new CalendarEventImportDriverException(
        error.message,
        CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    default:
      return new CalendarEventImportDriverException(
        error.message,
        CalendarEventImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR,
      );
  }
};
