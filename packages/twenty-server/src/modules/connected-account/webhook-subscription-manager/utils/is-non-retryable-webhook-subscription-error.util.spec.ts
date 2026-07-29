import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { isNonRetryableWebhookSubscriptionError } from 'src/modules/connected-account/webhook-subscription-manager/utils/is-non-retryable-webhook-subscription-error.util';

describe('isNonRetryableWebhookSubscriptionError', () => {
  it.each([
    ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
    ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
  ])('should return true for %s refresh token errors', (code) => {
    const error = new ConnectedAccountRefreshAccessTokenException(
      'refresh failed',
      code,
    );

    expect(isNonRetryableWebhookSubscriptionError(error)).toBe(true);
  });

  it.each([
    ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
    ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
    ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
  ])('should return false for %s refresh token errors', (code) => {
    const error = new ConnectedAccountRefreshAccessTokenException(
      'refresh failed',
      code,
    );

    expect(isNonRetryableWebhookSubscriptionError(error)).toBe(false);
  });

  it('should return true for forbidden subscription driver errors', () => {
    const error = new WebhookSubscriptionDriverException(
      'The user must be signed up for Google Calendar.',
      WebhookSubscriptionDriverExceptionCode.SUBSCRIPTION_FORBIDDEN,
    );

    expect(isNonRetryableWebhookSubscriptionError(error)).toBe(true);
  });

  it('should return false for other driver errors', () => {
    const error = new WebhookSubscriptionDriverException(
      'missing configuration',
      WebhookSubscriptionDriverExceptionCode.PROVIDER_NOT_CONFIGURED,
    );

    expect(isNonRetryableWebhookSubscriptionError(error)).toBe(false);
  });

  it('should return false for unknown errors', () => {
    expect(isNonRetryableWebhookSubscriptionError(new Error('boom'))).toBe(
      false,
    );
  });
});
