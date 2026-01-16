import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EventStreamExceptionCode {
  EVENT_STREAM_ALREADY_EXISTS = 'EVENT_STREAM_ALREADY_EXISTS',
}

const getEventStreamExceptionUserFriendlyMessage = (
  code: EventStreamExceptionCode,
) => {
  switch (code) {
    case EventStreamExceptionCode.EVENT_STREAM_ALREADY_EXISTS:
      return msg`Failed to receive real time updates.`;
    default:
      assertUnreachable(code);
  }
};

export class EventStreamException extends CustomException<EventStreamExceptionCode> {
  constructor(
    message: string,
    code: EventStreamExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getEventStreamExceptionUserFriendlyMessage(code),
    });
  }
}
