import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { parseCalDAVError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-error.util';

const expectCode = (
  message: string,
  code: CalendarEventImportDriverExceptionCode,
) => {
  expect(parseCalDAVError(new Error(message)).code).toBe(code);
};

describe('parseCalDAVError', () => {
  describe('already classified exceptions', () => {
    it('returns a driver exception untouched', () => {
      const exception = new CalendarEventImportDriverException(
        'Missing CalDAV credentials for connected account 01599b71-cde9-444c-843f-12acfce6df09',
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

      expect(parseCalDAVError(exception)).toBe(exception);
    });

    it('returns a refresh token exception untouched', () => {
      const exception = new ConnectedAccountRefreshAccessTokenException(
        'No refresh token found',
        ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      );

      expect(parseCalDAVError(exception)).toBe(exception);
    });

    it('is idempotent', () => {
      const once = parseCalDAVError(new Error('cannot find principalUrl'));

      expect(parseCalDAVError(once)).toBe(once);
    });
  });

  describe('authentication failures', () => {
    it.each([
      'Invalid auth method',
      'Basic auth header was not encoded correctly',
      "authMethod 'Custom' requires an authFunction to produce request headers",
      'Invalid credentials: PROPFIND https://dav.example.com/ returned 401 Unauthorized',
      'Oauth credentials missing: redirectUrl,clientId,clientSecret,tokenUrl',
      'Oauth credentials missing: refreshToken,clientId,clientSecret,tokenUrl',
    ])('maps "%s" to INSUFFICIENT_PERMISSIONS', (message) => {
      expectCode(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    });
  });

  describe('missing resources', () => {
    it.each([
      'Collection does not exist on server',
      'Calendar object to delete was not found',
      'Calendar object to update was not found',
      'Created calendar object was not found',
    ])('maps "%s" to NOT_FOUND', (message) => {
      expectCode(message, CalendarEventImportDriverExceptionCode.NOT_FOUND);
    });
  });

  describe('discovery failures are retryable', () => {
    it.each([
      'cannot find principalUrl',
      'cannot find homeUrl',
      'cannot find calendarUserAddresses',
      'no account for fetchCalendars',
      'no account for fetchAddressBooks',
      'no account for smartCollectionSync',
      'Must have account before syncCalendars',
      'account must have rootUrl before fetchPrincipalUrl',
      'account must have principalUrl before fetchHomeUrl',
      'account must have homeUrl,rootUrl before fetchCalendars',
      'account must have homeUrl,rootUrl before fetchAddressBooks',
      'account must have principalUrl,rootUrl before fetchUserAddresses',
      'account must have accountType,homeUrl before smartCollectionSync',
    ])('maps "%s" to TEMPORARY_ERROR', (message) => {
      expectCode(
        message,
        CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    });
  });

  describe('caller mistakes are not blamed on the account', () => {
    it.each([
      'cannot fetchCalendarObjects for undefined calendar',
      'cannot fetchVCards for undefined addressBook',
      'collection.fetchObjects is required for basic sync changes',
      'collection.objectMultiGet is required for webdav sync changes',
      'timeRange is required',
      'invalid timeRange format, not in ISO8601',
      'invalid timeRange: start must be before end',
      'invalid timeRange: start or end is not a valid date',
      'freeBusyQuery returned no response',
      'calendar must have url before fetchCalendarObjects',
      'addressBook must have url before fetchVCards',
    ])('maps "%s" to CHANNEL_MISCONFIGURED', (message) => {
      expectCode(
        message,
        CalendarEventImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
      );
    });
  });

  describe('http status carrying messages', () => {
    it.each([
      [
        'Collection query failed: 401 Unauthorized',
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      ],
      [
        'Collection status check failed: 401 Unauthorized',
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      ],
      [
        'Collection query failed: 403 Forbidden',
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      ],
      [
        'Collection query failed: 404 Not Found',
        CalendarEventImportDriverExceptionCode.NOT_FOUND,
      ],
      [
        'Collection query failed: 504 Gateway Time-out',
        CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
      ],
      [
        'Collection query failed: 429 Too Many Requests',
        CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
      ],
      [
        'Collection query failed: 400 Bad Request',
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      ],
    ])('maps "%s" by status', (message, code) => {
      expectCode(message, code);
    });
  });

  describe('fallbacks', () => {
    it('falls back to UNKNOWN for unrecognised errors', () => {
      expectCode(
        'TLS handshake failed',
        CalendarEventImportDriverExceptionCode.UNKNOWN,
      );
    });

    it('handles a non Error being thrown', () => {
      const result = parseCalDAVError('socket hang up');

      expect(result.code).toBe(CalendarEventImportDriverExceptionCode.UNKNOWN);
      expect(result.message).toBe('Unknown CalDAV error: socket hang up');
    });

    it('forwards the original error message untouched', () => {
      expect(parseCalDAVError(new Error('Invalid auth method')).message).toBe(
        'Invalid auth method',
      );
    });
  });
});
