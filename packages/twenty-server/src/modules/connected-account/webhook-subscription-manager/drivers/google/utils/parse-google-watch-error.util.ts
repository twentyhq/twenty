import { type GaxiosError } from 'gaxios';

import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';

// Thrown when the Google account has no Calendar product or is suspended.
const NOT_A_CALENDAR_USER_REASON = 'notACalendarUser';

export const parseGoogleWatchError = (error: GaxiosError): unknown => {
  const status = error.response?.status;
  const reason = error.response?.data?.error?.errors?.[0]?.reason;

  if (status === 403 && reason === NOT_A_CALENDAR_USER_REASON) {
    return new WebhookSubscriptionDriverException(
      error.message,
      WebhookSubscriptionDriverExceptionCode.SUBSCRIPTION_FORBIDDEN,
    );
  }

  return error;
};
