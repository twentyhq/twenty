import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WebhookExceptionCode {
  WEBHOOK_NOT_FOUND = 'WEBHOOK_NOT_FOUND',
  WEBHOOK_ALREADY_EXISTS = 'WEBHOOK_ALREADY_EXISTS',
  INVALID_WEBHOOK_INPUT = 'INVALID_WEBHOOK_INPUT',
  INVALID_TARGET_URL = 'INVALID_TARGET_URL',
}

const getWebhookExceptionUserFriendlyMessage = (code: WebhookExceptionCode) => {
  switch (code) {
    case WebhookExceptionCode.WEBHOOK_NOT_FOUND:
      return msg`Webhook not found.`;
    case WebhookExceptionCode.WEBHOOK_ALREADY_EXISTS:
      return msg`A webhook with this configuration already exists.`;
    case WebhookExceptionCode.INVALID_WEBHOOK_INPUT:
      return msg`Invalid webhook input.`;
    case WebhookExceptionCode.INVALID_TARGET_URL:
      return msg`Invalid target URL. Please provide a valid HTTP or HTTPS URL.`;
    default:
      assertUnreachable(code);
  }
};

export class WebhookException extends CustomException<WebhookExceptionCode> {
  constructor(
    message: string,
    code: WebhookExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getWebhookExceptionUserFriendlyMessage(code),
    });
  }
}
