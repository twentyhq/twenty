import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessageChannelExceptionCode {
  MESSAGE_CHANNEL_NOT_FOUND = 'MESSAGE_CHANNEL_NOT_FOUND',
  INVALID_MESSAGE_CHANNEL_INPUT = 'INVALID_MESSAGE_CHANNEL_INPUT',
}

const getMessageChannelExceptionUserFriendlyMessage = (
  code: MessageChannelExceptionCode,
) => {
  switch (code) {
    case MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND:
      return msg`Message channel not found.`;
    case MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT:
      return msg`Invalid message channel input.`;
    default:
      assertUnreachable(code);
  }
};

export class MessageChannelException extends CustomException<MessageChannelExceptionCode> {
  constructor(
    message: string,
    code: MessageChannelExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getMessageChannelExceptionUserFriendlyMessage(code),
    });
  }
}
