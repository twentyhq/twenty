import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessagingProviderExceptionCode {
  MESSAGING_PROVIDER_NOT_FOUND = 'MESSAGING_PROVIDER_NOT_FOUND',
  INVALID_MESSAGING_PROVIDER_INPUT = 'INVALID_MESSAGING_PROVIDER_INPUT',
  MESSAGING_PROVIDER_NAME_ALREADY_EXISTS = 'MESSAGING_PROVIDER_NAME_ALREADY_EXISTS',
  SEND_MESSAGE_NOT_AVAILABLE = 'SEND_MESSAGE_NOT_AVAILABLE',
  SEND_MESSAGE_FAILED = 'SEND_MESSAGE_FAILED',
}

const getMessagingProviderExceptionUserFriendlyMessage = (
  code: MessagingProviderExceptionCode,
) => {
  switch (code) {
    case MessagingProviderExceptionCode.MESSAGING_PROVIDER_NOT_FOUND:
      return msg`Messaging provider not found.`;
    case MessagingProviderExceptionCode.INVALID_MESSAGING_PROVIDER_INPUT:
      return msg`Invalid messaging provider input.`;
    case MessagingProviderExceptionCode.MESSAGING_PROVIDER_NAME_ALREADY_EXISTS:
      return msg`A messaging provider with this name already exists for this application.`;
    case MessagingProviderExceptionCode.SEND_MESSAGE_NOT_AVAILABLE:
      return msg`This message channel cannot send messages.`;
    case MessagingProviderExceptionCode.SEND_MESSAGE_FAILED:
      return msg`We could not send your message. Please try again.`;
    default:
      assertUnreachable(code);
  }
};

export class MessagingProviderException extends CustomException<MessagingProviderExceptionCode> {
  constructor(
    message: string,
    code: MessagingProviderExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getMessagingProviderExceptionUserFriendlyMessage(code),
    });
  }
}
