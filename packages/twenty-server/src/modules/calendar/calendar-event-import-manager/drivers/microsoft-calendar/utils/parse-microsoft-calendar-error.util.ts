import { type GraphError } from '@microsoft/microsoft-graph-client';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { isDefined } from 'twenty-shared/utils';

export const parseMicrosoftCalendarError = (
  error: GraphError,
): CalendarEventImportDriverException => {
  const { statusCode, message } = error;

  switch (statusCode) {
    case 400:
      if (!isDefined(message)) {
        return new CalendarEventImportDriverException(
          'Microsoft Graph API returned 400 with empty error body',
          CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );

    case 404:
      if (
        message?.includes(
          'The mailbox is either inactive, soft-deleted, or is hosted on-premise.',
        )
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

    case 410:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      );

    case 429:
    case 500:
    case 502:
    case 503:
    case 504:
    case 509:
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
    default:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );
  }
};
