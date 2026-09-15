import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessageListExceptionCode {
  MESSAGE_LIST_NOT_FOUND = 'MESSAGE_LIST_NOT_FOUND',
  MESSAGE_LIST_DUPLICATION_FAILED = 'MESSAGE_LIST_DUPLICATION_FAILED',
}

const getMessageListExceptionUserFriendlyMessage = (
  code: MessageListExceptionCode,
) => {
  switch (code) {
    case MessageListExceptionCode.MESSAGE_LIST_NOT_FOUND:
      return msg`List not found.`;
    case MessageListExceptionCode.MESSAGE_LIST_DUPLICATION_FAILED:
      return msg`Failed to duplicate list.`;
    default:
      assertUnreachable(code);
  }
};

export class MessageListException extends CustomException<MessageListExceptionCode> {
  constructor(
    message: string,
    code: MessageListExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getMessageListExceptionUserFriendlyMessage(code),
    });
  }
}
