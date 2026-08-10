import { isDefined } from 'twenty-shared/utils';

import { mapCalDavStatusToExceptionCode } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/map-caldav-status-to-exception-code.util';
import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';

const TSDAV_COLLECTION_QUERY_ERROR_REGEX =
  /^Collection query failed: (\d{3})\b/;

export const parseCalDAVError = (
  error: Error,
): CalendarEventImportDriverException => {
  const { message } = error;

  const collectionQueryStatus =
    TSDAV_COLLECTION_QUERY_ERROR_REGEX.exec(message)?.[1];

  if (isDefined(collectionQueryStatus)) {
    return new CalendarEventImportDriverException(
      message,
      mapCalDavStatusToExceptionCode(
        Number.parseInt(collectionQueryStatus, 10),
      ),
    );
  }

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
