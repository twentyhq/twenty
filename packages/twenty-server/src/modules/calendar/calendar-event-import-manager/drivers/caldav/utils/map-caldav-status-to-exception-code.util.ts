import { CalendarEventImportDriverExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

export const mapCalDavStatusToExceptionCode = (
  status: number | undefined,
): CalendarEventImportDriverExceptionCode => {
  switch (status) {
    case 401:
    case 403:
      return CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS;

    case 404:
    case 410:
      return CalendarEventImportDriverExceptionCode.NOT_FOUND;

    case 408:
    case 429:
    case 500:
    case 502:
    case 503:
    case 504:
    case 507:
      return CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR;

    default:
      return CalendarEventImportDriverExceptionCode.UNKNOWN;
  }
};
