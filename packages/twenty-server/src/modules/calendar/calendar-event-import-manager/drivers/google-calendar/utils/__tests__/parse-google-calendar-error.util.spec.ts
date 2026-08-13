import { CalendarEventImportDriverExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { parseGoogleCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/parse-google-calendar-error.util';

describe('parseGoogleCalendarError', () => {
  it('should be a sync cursor error when the sync token is no longer valid', () => {
    const exception = parseGoogleCalendarError({
      code: 410,
      reason: 'fullSyncRequired',
      message: 'Sync token is no longer valid, a full sync is required.',
    });

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    );
  });

  it('should be not found on a 404', () => {
    const exception = parseGoogleCalendarError({
      code: 404,
      reason: 'notFound',
      message: 'Not Found',
    });

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
    );
  });

  it('should be insufficient permissions when the grant is invalid', () => {
    const exception = parseGoogleCalendarError({
      code: 400,
      reason: 'invalid_grant',
      message: 'Token has been expired or revoked.',
    });

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be insufficient permissions when the user is not a calendar user', () => {
    const exception = parseGoogleCalendarError({
      code: 403,
      reason: 'notACalendarUser',
      message: 'The user must be signed up for Google Calendar.',
    });

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be temporary for an unrecognized status so channels are not killed on unknown errors', () => {
    const exception = parseGoogleCalendarError({
      code: 503,
      reason: 'backendError',
      message: 'Backend Error',
    });

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });
});
