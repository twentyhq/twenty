import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessageChannelExceptionCode {
  MESSAGE_CHANNEL_NOT_FOUND = 'MESSAGE_CHANNEL_NOT_FOUND',
  INVALID_MESSAGE_CHANNEL_INPUT = 'INVALID_MESSAGE_CHANNEL_INPUT',
  MESSAGE_CHANNEL_OWNERSHIP_VIOLATION = 'MESSAGE_CHANNEL_OWNERSHIP_VIOLATION',
  EMAIL_GROUP_NOT_CONFIGURED = 'EMAIL_GROUP_NOT_CONFIGURED',
  EMAIL_GROUP_SENDING_REQUIRES_PAID_PLAN = 'EMAIL_GROUP_SENDING_REQUIRES_PAID_PLAN',
}

const getMessageChannelExceptionUserFriendlyMessage = (
  code: MessageChannelExceptionCode,
) => {
  switch (code) {
    case MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND:
      return msg`Message channel not found.`;
    case MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT:
      return msg`Invalid message channel input.`;
    case MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION:
      return msg`You do not have access to this message channel.`;
    case MessageChannelExceptionCode.EMAIL_GROUP_NOT_CONFIGURED:
      return msg`Email group is not configured on this server.`;
    case MessageChannelExceptionCode.EMAIL_GROUP_SENDING_REQUIRES_PAID_PLAN:
      return msg`Sending from an email group is available once your workspace is on a paid plan and has been billed.`;
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
