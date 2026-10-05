import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum CalendarEventImportDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  SYNC_CURSOR_ERROR = 'SYNC_CURSOR_ERROR',
  UNKNOWN = 'UNKNOWN',
  UNKNOWN_NETWORK_ERROR = 'UNKNOWN_NETWORK_ERROR',
  HANDLE_ALIASES_REQUIRED = 'HANDLE_ALIASES_REQUIRED',
  CHANNEL_MISCONFIGURED = 'CHANNEL_MISCONFIGURED',
}

const getCalendarEventImportDriverExceptionUserFriendlyMessage = (
  code: CalendarEventImportDriverExceptionCode,
) => {
  switch (code) {
    case CalendarEventImportDriverExceptionCode.NOT_FOUND:
      return msg`Calendar event not found.`;
    case CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR:
      return msg`A temporary error occurred. Please try again.`;
    case CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
      return msg`Insufficient permissions to access calendar.`;
    case CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR:
      return msg`Calendar sync error.`;
    case CalendarEventImportDriverExceptionCode.UNKNOWN:
      return msg`An unknown calendar error occurred.`;
    case CalendarEventImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR:
      return msg`A network error occurred while accessing calendar.`;
    case CalendarEventImportDriverExceptionCode.HANDLE_ALIASES_REQUIRED:
      return msg`Handle aliases are required.`;
    case CalendarEventImportDriverExceptionCode.CHANNEL_MISCONFIGURED:
      return msg`Calendar channel is misconfigured.`;
    default:
      assertUnreachable(code);
  }
};
const CALENDAR_EVENT_IMPORT_DRIVER_EXCEPTION_CATEGORY_BY_CODE = {
  [CalendarEventImportDriverExceptionCode.NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS]:
    'INTERNAL_SERVER_ERROR',
  [CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [CalendarEventImportDriverExceptionCode.UNKNOWN]: 'INTERNAL_SERVER_ERROR',
  [CalendarEventImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [CalendarEventImportDriverExceptionCode.HANDLE_ALIASES_REQUIRED]:
    'INTERNAL_SERVER_ERROR',
  [CalendarEventImportDriverExceptionCode.CHANNEL_MISCONFIGURED]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  CalendarEventImportDriverExceptionCode,
  ExceptionCategory
>;

export class CalendarEventImportDriverException extends CustomException<CalendarEventImportDriverExceptionCode> {
  cause?: unknown;

  constructor(
    message: string,
    code: CalendarEventImportDriverExceptionCode,
    {
      userFriendlyMessage,
      cause,
    }: { userFriendlyMessage?: MessageDescriptor; cause?: unknown } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getCalendarEventImportDriverExceptionUserFriendlyMessage(code),
      category: CALENDAR_EVENT_IMPORT_DRIVER_EXCEPTION_CATEGORY_BY_CODE[code],
    });

    if (isDefined(cause)) {
      this.cause = cause;
    }
  }
}
