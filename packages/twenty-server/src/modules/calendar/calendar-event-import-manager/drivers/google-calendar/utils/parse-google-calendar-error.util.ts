import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

export const parseGoogleCalendarError = (
  error: {
    code?: number;
    reason: string;
    message: string;
  },
  options?: { cause?: unknown },
): CalendarEventImportDriverException => {
  const { code, reason, message } = error;

  if (code === 400) {
    if (reason === 'invalid_grant') {
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        options,
      );
    }

    if (reason !== 'failedPrecondition') {
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.UNKNOWN,
        options,
      );
    }
  }

  if (
    code === 403 &&
    (reason === 'notACalendarUser' ||
      message.includes('The user must be signed up for Google Calendar'))
  ) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      options,
    );
  }

  if (code === 404) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
      options,
    );
  }

  return new CalendarEventImportDriverException(
    message,
    CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    options,
  );
};
