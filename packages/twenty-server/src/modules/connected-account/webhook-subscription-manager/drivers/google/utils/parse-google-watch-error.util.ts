import { type GaxiosError } from 'gaxios';

import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';

const RETRIABLE_FORBIDDEN_REASONS = [
  'rateLimitExceeded',
  'userRateLimitExceeded',
];

export const parseGoogleWatchError = (error: GaxiosError): unknown => {
  const status = error.response?.status;
  const reason = error.response?.data?.error?.errors?.[0]?.reason ?? '';

  if (status === 403 && !RETRIABLE_FORBIDDEN_REASONS.includes(reason)) {
    return new WebhookSubscriptionDriverException(
      error.message,
      WebhookSubscriptionDriverExceptionCode.SUBSCRIPTION_FORBIDDEN,
    );
  }

  return error;
};
