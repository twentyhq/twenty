import { GoogleCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/types/google-calendar-error.type';
import {
  CalendarException,
  CalendarExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/exceptions/calendar.exception';

export const parseGoogleCalendarError = (
  error: GoogleCalendarError,
): CalendarException => {
  const { code, reason, message } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return new CalendarException(
          message,
          CalendarExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (reason === 'failedPrecondition') {
        return new CalendarException(
          message,
          CalendarExceptionCode.TEMPORARY_ERROR,
        );
      }

      return new CalendarException(message, CalendarExceptionCode.UNKNOWN);

    case 404:
      return new CalendarException(message, CalendarExceptionCode.NOT_FOUND);

    case 429:
      return new CalendarException(
        message,
        CalendarExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return new CalendarException(
          message,
          CalendarExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new CalendarException(
          message,
          CalendarExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

    case 401:
      return new CalendarException(
        message,
        CalendarExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    case 500:
      if (reason === 'backendError') {
        return new CalendarException(
          message,
          CalendarExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new CalendarException(message, CalendarExceptionCode.UNKNOWN);
      }

    default:
      break;
  }

  return new CalendarException(message, CalendarExceptionCode.UNKNOWN);
};
