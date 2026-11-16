import { type MessageDescriptor } from '@lingui/core';
import { HttpStatus } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WebhookExceptionCode {
  WEBHOOK_NOT_FOUND = 'WEBHOOK_NOT_FOUND',
  WEBHOOK_ALREADY_EXISTS = 'WEBHOOK_ALREADY_EXISTS',
  INVALID_WEBHOOK_INPUT = 'INVALID_WEBHOOK_INPUT',
  INVALID_TARGET_URL = 'INVALID_TARGET_URL',
  WEBHOOK_DELIVERY_FAILED = 'WEBHOOK_DELIVERY_FAILED',
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
    case WebhookExceptionCode.WEBHOOK_DELIVERY_FAILED:
      return msg`Webhook delivery failed and will be retried.`;
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
      // A remote endpoint being down is not a Twenty bug: sub-500 keeps it out of Sentry.
      statusCode:
        code === WebhookExceptionCode.WEBHOOK_DELIVERY_FAILED
          ? HttpStatus.FAILED_DEPENDENCY
          : undefined,
    });
  }
}
