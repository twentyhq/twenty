import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WebhookSubscriptionDriverExceptionCode {
  PROVIDER_NOT_CONFIGURED = 'PROVIDER_NOT_CONFIGURED',
  PROVIDER_RESPONSE_INVALID = 'PROVIDER_RESPONSE_INVALID',
  UNSUPPORTED_PROVIDER = 'UNSUPPORTED_PROVIDER',
}

const getWebhookSubscriptionDriverExceptionUserFriendlyMessage = (
  code: WebhookSubscriptionDriverExceptionCode,
) => {
  switch (code) {
    case WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED:
    case WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID:
    case WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER:
      return msg`The webhook subscription could not be managed for this account.`;
    default:
      assertUnreachable(code);
  }
};

export class WebhookSubscriptionDriverException extends CustomException<WebhookSubscriptionDriverExceptionCode> {
  constructor(
    message: string,
    code: WebhookSubscriptionDriverExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWebhookSubscriptionDriverExceptionUserFriendlyMessage(code),
    });
  }
}
