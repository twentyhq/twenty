import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

export const parseGoogleCalendarError = (error: {
  code?: number;
  reason: string;
  message: string;
}): CalendarEventImportDriverException => {
  const { code, reason, message } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return new CalendarEventImportDriverException(
          message,
          CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (reason === 'failedPrecondition') {
        return new CalendarEventImportDriverException(
          message,
          CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );

    case 404:
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
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return new CalendarEventImportDriverException(
          message,
          CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new CalendarEventImportDriverException(
          message,
          CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

    case 401:
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    case 500:
      if (reason === 'backendError' || reason === 'internal_failure') {
        return new CalendarEventImportDriverException(
          message,
          CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new CalendarEventImportDriverException(
          message,
          CalendarEventImportDriverExceptionCode.UNKNOWN,
        );
      }

    default:
      break;
  }

  return new CalendarEventImportDriverException(
    message,
    CalendarEventImportDriverExceptionCode.UNKNOWN,
  );
};
