import {
  CalendarDriverException,
  CalendarDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-driver.exception';

export const parseGoogleCalendarError = (error: {
  code?: number;
  reason: string;
  message: string;
}): CalendarDriverException => {
  const { code, reason, message } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return new CalendarDriverException(
          message,
          CalendarDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (reason === 'failedPrecondition') {
        return new CalendarDriverException(
          message,
          CalendarDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      return new CalendarDriverException(
        message,
        CalendarDriverExceptionCode.UNKNOWN,
      );

    case 404:
      return new CalendarDriverException(
        message,
        CalendarDriverExceptionCode.NOT_FOUND,
      );

    case 429:
      return new CalendarDriverException(
        message,
        CalendarDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return new CalendarDriverException(
          message,
          CalendarDriverExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new CalendarDriverException(
          message,
          CalendarDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

    case 401:
      return new CalendarDriverException(
        message,
        CalendarDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    case 500:
      if (reason === 'backendError') {
        return new CalendarDriverException(
          message,
          CalendarDriverExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new CalendarDriverException(
          message,
          CalendarDriverExceptionCode.UNKNOWN,
        );
      }

    default:
      break;
  }

  return new CalendarDriverException(
    message,
    CalendarDriverExceptionCode.UNKNOWN,
  );
};
