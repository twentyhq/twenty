import { type GaxiosError } from 'gaxios';
import { isDefined } from 'twenty-shared/utils';

import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';

export const parseGoogleWebhookSubscriptionError = (
  error: GaxiosError,
  options?: { cause?: unknown },
): WebhookSubscriptionDriverException => {
  if (!isDefined(error.response)) {
    return new WebhookSubscriptionDriverException(
      `Google API transport error: ${error.message}`,
      WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
      options,
    );
  }

  const googleApiError = {
    code: error.response?.status,
    reason:
      error.response?.data?.error?.errors?.[0].reason ||
      error.response?.data?.error ||
      'Unknown reason',
    message:
      error.response?.data?.error?.errors?.[0].message ||
      error.response?.data?.error_description ||
      'Unknown error',
  };

  switch (googleApiError.code) {
    case 400:
      if (googleApiError.reason === 'invalid_grant') {
        return new WebhookSubscriptionDriverException(
          googleApiError.message,
          WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
          options,
        );
      }

      if (googleApiError.reason === 'failedPrecondition') {
        return new WebhookSubscriptionDriverException(
          googleApiError.message,
          googleApiError.message.includes('Mail service not enabled')
            ? WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS
            : WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
          options,
        );
      }

      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.UNKNOWN,
        options,
      );

    case 401:
      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        options,
      );

    case 403:
      if (
        googleApiError.reason === 'rateLimitExceeded' ||
        googleApiError.reason === 'userRateLimitExceeded' ||
        googleApiError.reason === 'dailyLimitExceeded'
      ) {
        return new WebhookSubscriptionDriverException(
          googleApiError.message,
          WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
          options,
        );
      }

      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        options,
      );

    case 404:
      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.NOT_FOUND,
        options,
      );

    case 429:
    case 500:
    case 502:
    case 503:
    case 504:
      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
        options,
      );

    default:
      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.UNKNOWN,
        options,
      );
  }
};
