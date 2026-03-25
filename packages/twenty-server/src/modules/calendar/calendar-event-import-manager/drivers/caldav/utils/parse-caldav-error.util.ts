import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

export const parseCalDAVError = (
  error: Error,
): CalendarEventImportDriverException => {
  const { message } = error;

  switch (message) {
    case 'Collection does not exist on server':
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.NOT_FOUND,
      );

    case 'no account for smartCollectionSync':
    case 'no account for fetchAddressBooks':
    case 'no account for fetchCalendars':
    case 'Must have account before syncCalendars':
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 'cannot fetchVCards for undefined addressBook':
    case 'cannot find calendarUserAddresses':
    case 'cannot fetchCalendarObjects for undefined calendar':
    case 'cannot find homeUrl':
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.NOT_FOUND,
      );

    case 'Invalid credentials':
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 'Invalid auth method':
      return new CalendarEventImportDriverException(
        message,
        CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
  }

  return new CalendarEventImportDriverException(
    message,
    CalendarEventImportDriverExceptionCode.UNKNOWN,
  );
};
