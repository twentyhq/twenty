import { isDefined } from 'twenty-shared/utils';

import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';

const MICROSOFT_MAILBOX_NOT_ENABLED_FOR_REST_API_ERROR_CODE =
  'MailboxNotEnabledForRESTAPI';

export const parseMicrosoftWebhookSubscriptionError = (
  error: {
    statusCode: number;
    message?: string;
    code?: string | null;
  },
  options?: { cause?: unknown },
): WebhookSubscriptionDriverException => {
  if (error.statusCode === 400) {
    if (!isDefined(error.message)) {
      return new WebhookSubscriptionDriverException(
        'Microsoft Graph API returned 400 with empty error body',
        WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
        options,
      );
    }

    return new WebhookSubscriptionDriverException(
      `Invalid request to Microsoft Graph API: ${error.message}`,
      WebhookSubscriptionDriverExceptionCode.UNKNOWN,
      options,
    );
  }

  if (error.statusCode === 401) {
    return new WebhookSubscriptionDriverException(
      `Unauthorized access to Microsoft Graph API - code:${error.code} ${error.message}`,
      WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
      options,
    );
  }

  if (error.statusCode === 403) {
    return new WebhookSubscriptionDriverException(
      `Forbidden access to Microsoft Graph API - code:${error.code} ${error.message}`,
      WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      options,
    );
  }

  if (error.statusCode === 404) {
    if (error.code === MICROSOFT_MAILBOX_NOT_ENABLED_FOR_REST_API_ERROR_CODE) {
      return new WebhookSubscriptionDriverException(
        `Disabled, deleted, inactive or no licence Microsoft account - code:${error.code}`,
        WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        options,
      );
    }

    return new WebhookSubscriptionDriverException(
      `Not found - code:${error.code}`,
      WebhookSubscriptionDriverExceptionCode.NOT_FOUND,
      options,
    );
  }

  if (
    error.statusCode === 429 ||
    error.statusCode === 500 ||
    error.statusCode === 502 ||
    error.statusCode === 503 ||
    error.statusCode === 504 ||
    error.statusCode === 509
  ) {
    return new WebhookSubscriptionDriverException(
      `Microsoft Graph API ${error.code} ${error.statusCode} error: ${error.message}`,
      WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
      options,
    );
  }

  return new WebhookSubscriptionDriverException(
    `Microsoft Graph API unknown error: ${error.message} with status code ${error.statusCode}`,
    WebhookSubscriptionDriverExceptionCode.UNKNOWN,
    options,
  );
};
