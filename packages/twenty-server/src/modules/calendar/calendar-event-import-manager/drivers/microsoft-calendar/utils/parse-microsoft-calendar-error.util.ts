import { GraphError } from '@microsoft/microsoft-graph-client';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

export const parseMicrosoftCalendarError = (
  error: GraphError,
): CalendarEventImportDriverException => {
  const { statusCode, message } = error;

  switch (statusCode) {
    case 400:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );

    case 404:
      if (
        message ==
        'The mailbox is either inactive, soft-deleted, or is hosted on-premise.'
      ) {
        return new CalendarEventImportDriverException(
          message,
          CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.NOT_FOUND,
      );

    case 429:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 401:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    case 500:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );

    default:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );
  }
};
