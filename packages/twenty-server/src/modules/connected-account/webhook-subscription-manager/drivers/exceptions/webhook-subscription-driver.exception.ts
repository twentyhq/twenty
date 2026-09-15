import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WebhookSubscriptionDriverExceptionCode {
  PROVIDER_NOT_CONFIGURED = 'PROVIDER_NOT_CONFIGURED',
  PROVIDER_RESPONSE_INVALID = 'PROVIDER_RESPONSE_INVALID',
  UNSUPPORTED_PROVIDER = 'UNSUPPORTED_PROVIDER',
  NOT_FOUND = 'NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  UNKNOWN = 'UNKNOWN',
}

const getWebhookSubscriptionDriverExceptionUserFriendlyMessage = (
  code: WebhookSubscriptionDriverExceptionCode,
) => {
  switch (code) {
    case WebhookSubscriptionDriverExceptionCode.NOT_FOUND:
      return msg`The subscription is no longer available on the provider.`;
    case WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
      return msg`The provider denied access to this account. Please reconnect it.`;
    case WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR:
      return msg`The provider is temporarily unavailable. Please try again later.`;
    case WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED:
    case WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID:
    case WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER:
    case WebhookSubscriptionDriverExceptionCode.UNKNOWN:
      return msg`The webhook subscription could not be managed for this account.`;
    default:
      assertUnreachable(code);
  }
};

export class WebhookSubscriptionDriverException extends CustomException<WebhookSubscriptionDriverExceptionCode> {
  cause?: unknown;

  constructor(
    message: string,
    code: WebhookSubscriptionDriverExceptionCode,
    {
      userFriendlyMessage,
      cause,
    }: { userFriendlyMessage?: MessageDescriptor; cause?: unknown } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWebhookSubscriptionDriverExceptionUserFriendlyMessage(code),
    });

    if (isDefined(cause)) {
      this.cause = cause;
    }
  }
}
