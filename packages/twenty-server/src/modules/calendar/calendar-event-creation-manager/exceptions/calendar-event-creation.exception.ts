import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum CalendarEventCreationExceptionCode {
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  PROVIDER_REQUEST_FAILED = 'PROVIDER_REQUEST_FAILED',
}

const getCalendarEventCreationExceptionUserFriendlyMessage = (
  code: CalendarEventCreationExceptionCode,
) => {
  switch (code) {
    case CalendarEventCreationExceptionCode.PROVIDER_NOT_SUPPORTED:
      return msg`Calendar event creation is not supported for this account.`;
    case CalendarEventCreationExceptionCode.PROVIDER_REQUEST_FAILED:
      return msg`The calendar provider rejected the event creation request.`;
    default:
      assertUnreachable(code);
  }
};

export class CalendarEventCreationException extends CustomException<CalendarEventCreationExceptionCode> {
  constructor(
    message: string,
    code: CalendarEventCreationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getCalendarEventCreationExceptionUserFriendlyMessage(code),
    });
  }
}
