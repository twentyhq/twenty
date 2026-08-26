import { type GraphError } from '@microsoft/microsoft-graph-client';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { MICROSOFT_PERMANENT_ACCOUNT_ERROR_CODES } from 'src/modules/connected-account/constants/microsoft-permanent-account-error-codes.constant';
import { isDefined } from 'twenty-shared/utils';

export const parseMicrosoftCalendarError = (
  error: GraphError,
): CalendarEventImportDriverException => {
  const { statusCode, code, message } = error;

  if (
    isDefined(code) &&
    MICROSOFT_PERMANENT_ACCOUNT_ERROR_CODES.includes(code)
  ) {
    return new CalendarEventImportDriverException(
      `Disabled, deleted, unlicensed or inaccessible Microsoft account - code:${code}`,
      CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  }

  if (statusCode === 400 && isDefined(message)) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.UNKNOWN,
    );
  }

  if (statusCode === 404) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.NOT_FOUND,
    );
  }

  if (statusCode === 410) {
    return new CalendarEventImportDriverException(
      message,
      CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    );
  }

  return new CalendarEventImportDriverException(
    `Microsoft Graph API ${code} ${statusCode} error: ${message}`,
    CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
  );
};
