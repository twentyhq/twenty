import { CalendarEventImportDriverExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

export const mapCalDavStatusToExceptionCode = (
  status: number | undefined,
): CalendarEventImportDriverExceptionCode => {
  if (status === 401 || status === 403) {
    return CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS;
  }

  if (status === 404 || status === 410) {
    return CalendarEventImportDriverExceptionCode.NOT_FOUND;
  }

  if (status === 408 || status === 429 || (status ?? 0) >= 500) {
    return CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR;
  }

  return CalendarEventImportDriverExceptionCode.UNKNOWN;
};
