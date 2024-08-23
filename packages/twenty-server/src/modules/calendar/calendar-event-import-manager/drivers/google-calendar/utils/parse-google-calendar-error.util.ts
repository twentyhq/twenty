import { GoogleCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/types/google-calendar-error.type';
import {
  CalendarEventError,
  CalendarExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/exceptions/calendar.exception';

export const parseGoogleCalendarError = (
  error: GoogleCalendarError,
): CalendarEventError => {
  const { code, reason, message } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return {
          code: CalendarExceptionCode.INSUFFICIENT_PERMISSIONS,
          message,
        };
      }
      if (reason === 'failedPrecondition') {
        return {
          code: CalendarExceptionCode.TEMPORARY_ERROR,
          message,
        };
      }

      return {
        code: CalendarExceptionCode.UNKNOWN,
        message,
      };

    case 404:
      return {
        code: CalendarExceptionCode.NOT_FOUND,
        message,
      };

    case 429:
      return {
        code: CalendarExceptionCode.TEMPORARY_ERROR,
        message,
      };

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return {
          code: CalendarExceptionCode.TEMPORARY_ERROR,
          message,
        };
      } else {
        return {
          code: CalendarExceptionCode.INSUFFICIENT_PERMISSIONS,
          message,
        };
      }

    case 401:
      return {
        code: CalendarExceptionCode.INSUFFICIENT_PERMISSIONS,
        message,
      };
    case 500:
      if (reason === 'backendError') {
        return {
          code: CalendarExceptionCode.TEMPORARY_ERROR,
          message,
        };
      } else {
        return {
          code: CalendarExceptionCode.UNKNOWN,
          message,
        };
      }

    default:
      break;
  }

  return {
    code: CalendarExceptionCode.UNKNOWN,
    message,
  };
};
