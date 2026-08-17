import { mapCalDavStatusToExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/map-caldav-status-to-exception-code.util';
import { CalendarEventImportDriverExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

describe('mapCalDavStatusToExceptionCode', () => {
  it('maps auth failures to INSUFFICIENT_PERMISSIONS', () => {
    expect(mapCalDavStatusToExceptionCode(401)).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
    expect(mapCalDavStatusToExceptionCode(403)).toBe(
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('maps missing collections to NOT_FOUND', () => {
    expect(mapCalDavStatusToExceptionCode(404)).toBe(
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
    );
    expect(mapCalDavStatusToExceptionCode(410)).toBe(
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
    );
  });

  it('maps throttling and server failures to TEMPORARY_ERROR', () => {
    expect(mapCalDavStatusToExceptionCode(408)).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(mapCalDavStatusToExceptionCode(429)).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(mapCalDavStatusToExceptionCode(500)).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(mapCalDavStatusToExceptionCode(502)).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(mapCalDavStatusToExceptionCode(503)).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(mapCalDavStatusToExceptionCode(504)).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(mapCalDavStatusToExceptionCode(507)).toBe(
      CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('falls back to UNKNOWN for unrecognised statuses', () => {
    expect(mapCalDavStatusToExceptionCode(400)).toBe(
      CalendarEventImportDriverExceptionCode.UNKNOWN,
    );
    expect(mapCalDavStatusToExceptionCode(418)).toBe(
      CalendarEventImportDriverExceptionCode.UNKNOWN,
    );
  });

  it('falls back to UNKNOWN when the server sent no status', () => {
    expect(mapCalDavStatusToExceptionCode(undefined)).toBe(
      CalendarEventImportDriverExceptionCode.UNKNOWN,
    );
  });
});
