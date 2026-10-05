import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum CalendarEventImportExceptionCode {
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  UNKNOWN = 'UNKNOWN',
}

const getCalendarEventImportExceptionUserFriendlyMessage = (
  code: CalendarEventImportExceptionCode,
) => {
  switch (code) {
    case CalendarEventImportExceptionCode.PROVIDER_NOT_SUPPORTED:
      return msg`Calendar provider is not supported.`;
    case CalendarEventImportExceptionCode.UNKNOWN:
      return msg`An unknown calendar error occurred.`;
    default:
      assertUnreachable(code);
  }
};
const CALENDAR_EVENT_IMPORT_EXCEPTION_CATEGORY_BY_CODE = {
  [CalendarEventImportExceptionCode.PROVIDER_NOT_SUPPORTED]:
    'INTERNAL_SERVER_ERROR',
  [CalendarEventImportExceptionCode.UNKNOWN]: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  CalendarEventImportExceptionCode,
  ExceptionCategory
>;

export class CalendarEventImportException extends CustomException<CalendarEventImportExceptionCode> {
  constructor(
    message: string,
    code: CalendarEventImportExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getCalendarEventImportExceptionUserFriendlyMessage(code),
      category: CALENDAR_EVENT_IMPORT_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
