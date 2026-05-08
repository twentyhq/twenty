import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EventStreamExceptionCode {
  EVENT_STREAM_ALREADY_EXISTS = 'EVENT_STREAM_ALREADY_EXISTS',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
}

const getEventStreamExceptionUserFriendlyMessage = (
  code: EventStreamExceptionCode,
) => {
  switch (code) {
    case EventStreamExceptionCode.EVENT_STREAM_ALREADY_EXISTS:
      return msg`Failed to receive real time updates.`;
    case EventStreamExceptionCode.NOT_AUTHORIZED:
      return msg`You are not authorized to perform this action.`;
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
