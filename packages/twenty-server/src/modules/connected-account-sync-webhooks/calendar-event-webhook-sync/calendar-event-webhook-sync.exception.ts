import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum CalendarEventWebhookSyncExceptionCode {
  CALENDAR_CHANNEL_SYNC_ALREADY_IN_PROGRESS = 'CALENDAR_CHANNEL_SYNC_ALREADY_IN_PROGRESS',
}

const getCalendarEventWebhookSyncExceptionUserFriendlyMessage = (
  code: CalendarEventWebhookSyncExceptionCode,
) => {
  switch (code) {
    case CalendarEventWebhookSyncExceptionCode.CALENDAR_CHANNEL_SYNC_ALREADY_IN_PROGRESS:
      return msg`The calendar is already syncing.`;
    default:
      assertUnreachable(code);
  }
};

export class CalendarEventWebhookSyncException extends CustomException<CalendarEventWebhookSyncExceptionCode> {
  constructor(
    message: string,
    code: CalendarEventWebhookSyncExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getCalendarEventWebhookSyncExceptionUserFriendlyMessage(code),
    });
  }
}
