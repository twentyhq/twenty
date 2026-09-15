import { type GraphError } from '@microsoft/microsoft-graph-client';

import { CalendarEventImportDriverExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { parseMicrosoftCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/parse-microsoft-calendar-error.util';

const buildGraphError = ({
  statusCode,
  code = null,
  message = 'error message',
}: {
  statusCode: number;
  code?: string | null;
  message?: string;
}) => ({ statusCode, code, message }) as GraphError;

describe('parseMicrosoftCalendarError', () => {
  it('should be temporary when the access token is expired so the next attempt can refresh it', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({
        statusCode: 401,
        code: 'InvalidAuthenticationToken',
        message: 'Lifetime validation failed, the token is expired.',
      }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should be temporary when access is denied because Graph 403s can be transient mailbox-level denials', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({ statusCode: 403, code: 'ErrorAccessDenied' }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should be insufficient permissions when the mailbox is not enabled for the REST API', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({
        statusCode: 404,
        code: 'MailboxNotEnabledForRESTAPI',
        message: 'Some reworded message from Microsoft.',
      }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be insufficient permissions when the account has no valid licence', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({
        statusCode: 403,
        code: 'ErrorInvalidLicense',
        message: 'The license of the user is invalid.',
      }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be insufficient permissions on a dead-account code regardless of status code', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({
        statusCode: 500,
        code: 'ErrorAccountDisabled',
        message: 'The account in question has been disabled.',
      }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be not found for a 404 that is not a mailbox error', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({ statusCode: 404, code: 'ResourceNotFound' }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
    );
  });

  it('should be a sync cursor error when the delta token is no longer valid', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({ statusCode: 410, code: 'SyncStateNotFound' }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    );
  });

  it('should be temporary when throttled', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({ statusCode: 429, code: 'TooManyRequests' }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should be temporary when the service is unavailable', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({ statusCode: 503 }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should be temporary for an unhandled status code so channels are never killed on unrecognized errors', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({ statusCode: 418 }),
    );

    expect(exception.code).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });
});
