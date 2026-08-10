import { mapCalDavStatusToExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/map-caldav-status-to-exception-code.util';
import { CalendarEventImportDriverExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

describe('mapCalDavStatusToExceptionCode', () => {
  it.each([
    [401, CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS],
    [403, CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS],
    [404, CalendarEventImportDriverExceptionCode.NOT_FOUND],
    [410, CalendarEventImportDriverExceptionCode.NOT_FOUND],
    [408, CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR],
    [429, CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR],
    [500, CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR],
    [502, CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR],
    [503, CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR],
    [504, CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR],
    [507, CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR],
    [400, CalendarEventImportDriverExceptionCode.UNKNOWN],
    [418, CalendarEventImportDriverExceptionCode.UNKNOWN],
    [undefined, CalendarEventImportDriverExceptionCode.UNKNOWN],
  ])('maps %s to %s', (status, expectedCode) => {
    expect(mapCalDavStatusToExceptionCode(status)).toBe(expectedCode);
  });
});
