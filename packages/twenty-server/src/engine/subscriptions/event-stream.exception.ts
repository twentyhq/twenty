import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

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
const EVENT_STREAM_EXCEPTION_CATEGORY_BY_CODE = {
  [EventStreamExceptionCode.EVENT_STREAM_ALREADY_EXISTS]: 'FORBIDDEN',
  [EventStreamExceptionCode.NOT_AUTHORIZED]: 'FORBIDDEN',
} as const satisfies Record<EventStreamExceptionCode, ExceptionCategory>;

export class EventStreamException extends CustomException<EventStreamExceptionCode> {
  constructor(
    message: string,
    code: EventStreamExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getEventStreamExceptionUserFriendlyMessage(code),
      category: EVENT_STREAM_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
