import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

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

const calendarEventImportDriverExceptionUserFriendlyMessages: Record<
  CalendarEventImportDriverExceptionCode,
  MessageDescriptor
> = {
  [CalendarEventImportDriverExceptionCode.NOT_FOUND]: msg`Calendar event not found.`,
  [CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR]: msg`A temporary error occurred. Please try again.`,
  [CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS]: msg`Insufficient permissions to access calendar.`,
  [CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR]: msg`Calendar sync error.`,
  [CalendarEventImportDriverExceptionCode.UNKNOWN]: msg`An unknown calendar error occurred.`,
  [CalendarEventImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR]: msg`A network error occurred while accessing calendar.`,
  [CalendarEventImportDriverExceptionCode.HANDLE_ALIASES_REQUIRED]: msg`Handle aliases are required.`,
  [CalendarEventImportDriverExceptionCode.CHANNEL_MISCONFIGURED]: msg`Calendar channel is misconfigured.`,
};

export class CalendarEventImportDriverException extends CustomException<CalendarEventImportDriverExceptionCode> {
  constructor(
    message: string,
    code: CalendarEventImportDriverExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        calendarEventImportDriverExceptionUserFriendlyMessages[code],
    });
  }
}
