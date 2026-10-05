import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessageListExceptionCode {
  MESSAGE_LIST_NOT_FOUND = 'MESSAGE_LIST_NOT_FOUND',
  MESSAGE_LIST_DUPLICATION_FAILED = 'MESSAGE_LIST_DUPLICATION_FAILED',
  TOO_MANY_PEOPLE_TO_ADD = 'TOO_MANY_PEOPLE_TO_ADD',
  ADDING_PEOPLE_IN_PROGRESS = 'ADDING_PEOPLE_IN_PROGRESS',
  ADDING_PEOPLE_FAILED = 'ADDING_PEOPLE_FAILED',
}

const getMessageListExceptionUserFriendlyMessage = (
  code: MessageListExceptionCode,
) => {
  switch (code) {
    case MessageListExceptionCode.MESSAGE_LIST_NOT_FOUND:
      return msg`List not found.`;
    case MessageListExceptionCode.MESSAGE_LIST_DUPLICATION_FAILED:
      return msg`Failed to duplicate list.`;
    case MessageListExceptionCode.TOO_MANY_PEOPLE_TO_ADD:
      return msg`Too many people selected. Narrow your selection and try again.`;
    case MessageListExceptionCode.ADDING_PEOPLE_IN_PROGRESS:
      return msg`People are already being added to this list. Please wait for it to finish.`;
    case MessageListExceptionCode.ADDING_PEOPLE_FAILED:
      return msg`Failed to add people to the list.`;
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
