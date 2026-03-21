import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum CalendarChannelExceptionCode {
  CALENDAR_CHANNEL_NOT_FOUND = 'CALENDAR_CHANNEL_NOT_FOUND',
  INVALID_CALENDAR_CHANNEL_INPUT = 'INVALID_CALENDAR_CHANNEL_INPUT',
  CALENDAR_CHANNEL_OWNERSHIP_VIOLATION = 'CALENDAR_CHANNEL_OWNERSHIP_VIOLATION',
}

const getCalendarChannelExceptionUserFriendlyMessage = (
  code: CalendarChannelExceptionCode,
) => {
  switch (code) {
    case CalendarChannelExceptionCode.CALENDAR_CHANNEL_NOT_FOUND:
      return msg`Calendar channel not found.`;
    case CalendarChannelExceptionCode.INVALID_CALENDAR_CHANNEL_INPUT:
      return msg`Invalid calendar channel input.`;
    case CalendarChannelExceptionCode.CALENDAR_CHANNEL_OWNERSHIP_VIOLATION:
      return msg`You do not have access to this calendar channel.`;
    default:
      assertUnreachable(code);
  }
};

export class CalendarChannelException extends CustomException<CalendarChannelExceptionCode> {
  constructor(
    message: string,
    code: CalendarChannelExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getCalendarChannelExceptionUserFriendlyMessage(code),
    });
  }
}
