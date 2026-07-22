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

  it('should be insufficient permissions when access is denied', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({ statusCode: 403, code: 'ErrorAccessDenied' }),
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

  it('should be unknown for an unhandled status code', () => {
    const exception = parseMicrosoftCalendarError(
      buildGraphError({ statusCode: 418 }),
    );

    expect(exception.code).toBe(CalendarEventImportDriverExceptionCode.UNKNOWN);
  });
});
