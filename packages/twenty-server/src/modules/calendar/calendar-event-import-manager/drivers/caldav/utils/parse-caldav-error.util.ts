import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { ConnectedAccountRefreshAccessTokenException } from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { TwentyORMException } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

type ClassifiedException =
  | CalendarEventImportDriverException
  | ConnectedAccountRefreshAccessTokenException
  | TwentyORMException;

const CALDAV_AUTH_ERROR_MESSAGES = [
  'Invalid auth method',
  'Basic auth header was not encoded correctly',
  "authMethod 'Custom' requires an authFunction to produce request headers",
];

const CALDAV_NOT_FOUND_ERROR_MESSAGES = [
  'Collection does not exist on server',
  'Calendar object to delete was not found',
  'Calendar object to update was not found',
  'Created calendar object was not found',
];

const CALDAV_DISCOVERY_ERROR_MESSAGES = [
  'cannot find principalUrl',
  'cannot find homeUrl',
  'cannot find calendarUserAddresses',
  'no account for fetchCalendars',
  'no account for fetchAddressBooks',
  'no account for smartCollectionSync',
  'Must have account before syncCalendars',
];

const CALDAV_CALLER_ERROR_MESSAGES = [
  'cannot fetchCalendarObjects for undefined calendar',
  'cannot fetchVCards for undefined addressBook',
  'collection.fetchObjects is required for basic sync changes',
  'collection.objectMultiGet is required for webdav sync changes',
  'timeRange is required',
  'invalid timeRange format, not in ISO8601',
  'invalid timeRange: start must be before end',
  'invalid timeRange: start or end is not a valid date',
  'freeBusyQuery returned no response',
  'DAVClient not exported from built ESM bundle',
];

const CALDAV_AUTH_ERROR_PREFIXES = [
  'Invalid credentials',
  'Oauth credentials missing:',
];

const CALDAV_HTTP_ERROR_PREFIXES = [
  'Collection query failed:',
  'Collection status check failed:',
];

const CALDAV_DISCOVERY_ERROR_PATTERN = /^account must have .+ before /;
const CALDAV_CALLER_ERROR_PATTERN = /^\w+ must have url before /;
const CALDAV_HTTP_STATUS_PATTERN = /failed: (\d{3})\b/;

const parseCalDAVHttpStatusError = (
  message: string,
): CalendarEventImportDriverException => {
  const status = Number(message.match(CALDAV_HTTP_STATUS_PATTERN)?.[1]);

  if (status === 401 || status === 403) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  }

  if (status === 404 || status === 410) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
    );
  }

  if (status === 408 || status === 429 || status >= 500) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  }

  return new CalendarEventImportDriverException(
    message,
    CalendarEventImportDriverExceptionCode.UNKNOWN,
  );
};

export const parseCalDAVError = (error: unknown): ClassifiedException => {
  if (
    error instanceof CalendarEventImportDriverException ||
    error instanceof ConnectedAccountRefreshAccessTokenException ||
    error instanceof TwentyORMException
  ) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : `Unknown CalDAV error: ${error}`;

  if (CALDAV_HTTP_ERROR_PREFIXES.some((prefix) => message.startsWith(prefix))) {
    return parseCalDAVHttpStatusError(message);
  }

  if (
    CALDAV_AUTH_ERROR_MESSAGES.includes(message) ||
    CALDAV_AUTH_ERROR_PREFIXES.some((prefix) => message.startsWith(prefix))
  ) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  }

  if (CALDAV_NOT_FOUND_ERROR_MESSAGES.includes(message)) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
    );
  }

  if (
    CALDAV_CALLER_ERROR_MESSAGES.includes(message) ||
    CALDAV_CALLER_ERROR_PATTERN.test(message)
  ) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
    );
  }

  if (
    CALDAV_DISCOVERY_ERROR_MESSAGES.includes(message) ||
    CALDAV_DISCOVERY_ERROR_PATTERN.test(message)
  ) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  }

  return new CalendarEventImportDriverException(
    message,
    CalendarEventImportDriverExceptionCode.UNKNOWN,
  );
};
