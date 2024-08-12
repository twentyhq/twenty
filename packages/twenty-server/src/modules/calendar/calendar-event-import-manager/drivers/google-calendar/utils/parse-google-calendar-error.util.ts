import { GoogleCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/types/google-calendar-error.type';
import {
  CalendarEventError,
  CalendarEventErrorCode,
} from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-error.type';

export const parseGoogleCalendarError = (
  error: GoogleCalendarError,
): CalendarEventError => {
  const { code, reason, message } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return {
          code: CalendarEventErrorCode.INSUFFICIENT_PERMISSIONS,
          message,
        };
      }
      if (reason === 'failedPrecondition') {
        return {
          code: CalendarEventErrorCode.TEMPORARY_ERROR,
          message,
        };
      }

      return {
        code: CalendarEventErrorCode.UNKNOWN,
        message,
      };

    case 404:
      return {
        code: CalendarEventErrorCode.NOT_FOUND,
        message,
      };

    case 429:
      return {
        code: CalendarEventErrorCode.TEMPORARY_ERROR,
        message,
      };

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return {
          code: CalendarEventErrorCode.TEMPORARY_ERROR,
          message,
        };
      } else {
        return {
          code: CalendarEventErrorCode.INSUFFICIENT_PERMISSIONS,
          message,
        };
      }

    case 401:
      return {
        code: CalendarEventErrorCode.INSUFFICIENT_PERMISSIONS,
        message,
      };
    case 500:
      if (reason === 'backendError') {
        return {
          code: CalendarEventErrorCode.TEMPORARY_ERROR,
          message,
        };
      } else {
        return {
          code: CalendarEventErrorCode.UNKNOWN,
          message,
        };
      }

    default:
      break;
  }

  return {
    code: CalendarEventErrorCode.UNKNOWN,
    message,
  };
};
