import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { parseCalDAVError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-error.util';

describe('parseCalDAVError', () => {
  it('maps tsdav auth-failure messages to INSUFFICIENT_PERMISSIONS', () => {
    for (const message of [
      'no account for fetchCalendars',
      'Must have account before syncCalendars',
      'Invalid credentials',
      'Invalid auth method',
    ]) {
      const result = parseCalDAVError(new Error(message));

      expect(result).toBeInstanceOf(CalendarEventImportDriverException);
      expect(result.code).toBe(
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }
  });

  it('maps tsdav not-found messages to NOT_FOUND', () => {
    for (const message of [
      'Collection does not exist on server',
      'cannot find homeUrl',
      'cannot fetchCalendarObjects for undefined calendar',
    ]) {
      expect(parseCalDAVError(new Error(message)).code).toBe(
        CalendarEventImportDriverExceptionCode.NOT_FOUND,
      );
    }
  });

  it('falls back to UNKNOWN for unrecognised errors', () => {
    expect(parseCalDAVError(new Error('TLS handshake failed')).code).toBe(
      CalendarEventImportDriverExceptionCode.UNKNOWN,
    );
  });

  it('forwards the original error message untouched', () => {
    const result = parseCalDAVError(new Error('Invalid credentials'));

    expect(result.message).toBe('Invalid credentials');
  });
});
