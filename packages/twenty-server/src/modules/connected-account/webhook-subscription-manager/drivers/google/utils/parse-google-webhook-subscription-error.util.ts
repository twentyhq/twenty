import { type GaxiosError } from 'gaxios';

import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';

export const parseGoogleWebhookSubscriptionError = (
  error: GaxiosError,
): WebhookSubscriptionDriverException => {
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
        );
      }

      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.UNKNOWN,
      );

    case 401:
      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
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
        );
      }

      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 404:
      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.NOT_FOUND,
      );

    case 429:
    case 500:
    case 502:
    case 503:
    case 504:
      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
      );

    default:
      return new WebhookSubscriptionDriverException(
        googleApiError.message,
        WebhookSubscriptionDriverExceptionCode.UNKNOWN,
      );
  }
};
