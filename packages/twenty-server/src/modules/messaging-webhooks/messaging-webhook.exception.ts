import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

const getMessagingWebhookExceptionUserFriendlyMessage = (
  code: MessagingWebhookExceptionCode,
) => {
  switch (code) {
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_MISSING_REQUEST_BODY:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SUBSCRIBE_URL:
      return msg`The webhook request could not be processed.`;
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_FORBIDDEN_TOPIC:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_NOT_CONFIGURED:
      return msg`The webhook request could not be authenticated.`;
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_SUBSCRIPTION_CONFIRMATION_FAILED:
    case MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_UNHANDLED_ERROR:
      return msg`An error occurred while processing the webhook.`;
    default:
      assertUnreachable(code);
  }
};
const MESSAGING_WEBHOOK_EXCEPTION_CATEGORY_BY_CODE = {
  [MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_MISSING_REQUEST_BODY]:
    'BAD_USER_INPUT',
  [MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_PAYLOAD]:
    'BAD_USER_INPUT',
  [MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_FORBIDDEN_TOPIC]:
    'FORBIDDEN',
  [MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SIGNATURE]:
    'FORBIDDEN',
  [MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_INVALID_SUBSCRIBE_URL]:
    'BAD_USER_INPUT',
  [MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_SUBSCRIPTION_CONFIRMATION_FAILED]:
    'INTERNAL_SERVER_ERROR',
  [MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_UNHANDLED_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_NOT_CONFIGURED]: 'FORBIDDEN',
} as const satisfies Record<MessagingWebhookExceptionCode, ExceptionCategory>;

export class MessagingWebhookException extends CustomException<MessagingWebhookExceptionCode> {
  constructor(
    message: string,
    code: MessagingWebhookExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getMessagingWebhookExceptionUserFriendlyMessage(code),
      category: MESSAGING_WEBHOOK_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
