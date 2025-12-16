import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum CalendarEventImportExceptionCode {
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  UNKNOWN = 'UNKNOWN',
}

const calendarEventImportExceptionUserFriendlyMessages: Record<
  CalendarEventImportExceptionCode,
  MessageDescriptor
> = {
  [CalendarEventImportExceptionCode.PROVIDER_NOT_SUPPORTED]: msg`Calendar provider is not supported.`,
  [CalendarEventImportExceptionCode.UNKNOWN]: msg`An unknown calendar error occurred.`,
};

export class CalendarEventImportException extends CustomException<CalendarEventImportExceptionCode> {
  constructor(
    message: string,
    code: CalendarEventImportExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        calendarEventImportExceptionUserFriendlyMessages[code],
    });
  }
}
