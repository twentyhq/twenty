import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';

export const isNonRetryableWebhookSubscriptionError = (
  error: unknown,
): boolean => {
  if (error instanceof ConnectedAccountRefreshAccessTokenException) {
    return [
      ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
    ].includes(error.code);
  }

  return (
    error instanceof WebhookSubscriptionDriverException &&
    error.code === WebhookSubscriptionDriverExceptionCode.SUBSCRIPTION_FORBIDDEN
  );
};
