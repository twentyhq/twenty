import { type GaxiosError, type RetryConfig } from 'gaxios';
import { isDefined } from 'twenty-shared/utils';

import { isGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-api-error.util';

const GMAIL_MAX_RETRIES = 8;
const GMAIL_NO_RESPONSE_MAX_RETRIES = 2;
const GMAIL_FIRST_RETRY_DELAY_MS = 1_000;
const GMAIL_MAX_RETRY_DELAY_MS = 64_000;

const GMAIL_RETRYABLE_RATE_LIMIT_REASONS = [
  'rateLimitExceeded',
  'userRateLimitExceeded',
];

const isRetryableGmailError = (error: GaxiosError): boolean => {
  const status = error.response?.status;

  if (!isDefined(status)) {
    return true;
  }

  if (status === 429 || (status >= 500 && status <= 599)) {
    return true;
  }

  if (status !== 403 || !isGmailApiError(error)) {
    return false;
  }

  const reason =
    error.response?.data?.error?.errors?.[0]?.reason ||
    error.response?.data?.error;

  return GMAIL_RETRYABLE_RATE_LIMIT_REASONS.includes(reason);
};

export const buildGmailRetryConfig = (): RetryConfig => ({
  retry: GMAIL_MAX_RETRIES,
  retryDelay: GMAIL_FIRST_RETRY_DELAY_MS,
  maxRetryDelay: GMAIL_MAX_RETRY_DELAY_MS,
  shouldRetry: (error: GaxiosError) => {
    const attemptedRetries =
      error.config?.retryConfig?.currentRetryAttempt ?? 0;

    const maxRetries = isDefined(error.response?.status)
      ? GMAIL_MAX_RETRIES
      : GMAIL_NO_RESPONSE_MAX_RETRIES;

    if (attemptedRetries >= maxRetries) {
      return false;
    }

    return isRetryableGmailError(error);
  },
});
