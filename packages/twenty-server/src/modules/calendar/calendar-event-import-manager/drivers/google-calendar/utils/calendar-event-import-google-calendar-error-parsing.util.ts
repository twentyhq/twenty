import {
  CalendarEventError,
  CalendarEventErrorCode,
} from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-error.type';

export const parseGoogleCalendarError = (error: any): CalendarEventError => {
  const { code, reason } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return {
          code: CalendarEventErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Invalid grant',
        };
      }
      if (reason === 'failedPrecondition') {
        return {
          code: CalendarEventErrorCode.TEMPORARY_ERROR,
          message: 'failedPrecondition',
        };
      }

      return {
        code: CalendarEventErrorCode.UNKNOWN,
        message: 'Unknown error',
      };

    case 404:
      return {
        code: CalendarEventErrorCode.NOT_FOUND,
        message: 'Not found',
      };

    case 429:
      return {
        code: CalendarEventErrorCode.TEMPORARY_ERROR,
        message: 'rateLimitExceeded',
      };

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return {
          code: CalendarEventErrorCode.TEMPORARY_ERROR,
          message: 'rateLimitExceeded',
        };
      } else {
        return {
          code: CalendarEventErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Insufficient permissions',
        };
      }

    case 401:
      return {
        code: CalendarEventErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'Unauthorized',
      };
    case 500:
      if (reason === 'backendError') {
        return {
          code: CalendarEventErrorCode.TEMPORARY_ERROR,
          message: 'backendError',
        };
      } else {
        return {
          code: CalendarEventErrorCode.UNKNOWN,
          message: 'Unknown error',
        };
      }

    default:
      break;
  }

  return {
    code: CalendarEventErrorCode.UNKNOWN,
    message: 'Unknown error',
  };
};
