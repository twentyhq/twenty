import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

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
const WEBHOOK_SUBSCRIPTION_DRIVER_EXCEPTION_CATEGORY_BY_CODE = {
  [WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED]:
    'INTERNAL_SERVER_ERROR',
  [WebhookSubscriptionDriverExceptionCode.PROVIDER_RESPONSE_INVALID]:
    'INTERNAL_SERVER_ERROR',
  [WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER]:
    'INTERNAL_SERVER_ERROR',
  [WebhookSubscriptionDriverExceptionCode.NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS]:
    'INTERNAL_SERVER_ERROR',
  [WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [WebhookSubscriptionDriverExceptionCode.UNKNOWN]: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  WebhookSubscriptionDriverExceptionCode,
  ExceptionCategory
>;

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
      category: WEBHOOK_SUBSCRIPTION_DRIVER_EXCEPTION_CATEGORY_BY_CODE[code],
    });

    if (isDefined(cause)) {
      this.cause = cause;
    }
  }
}
