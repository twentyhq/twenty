import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { parseGoogleWatchError } from 'src/modules/connected-account/webhook-subscription-manager/drivers/google/utils/parse-google-watch-error.util';
import { createMockGaxiosError } from 'src/modules/messaging/message-import-manager/drivers/gmail/mocks/create-mock-gaxios-error.util';

const createWatchError = (status: number, reason: string, message: string) =>
  createMockGaxiosError({
    message,
    status,
    data: { error: { errors: [{ reason, message }] } },
  });

describe('parseGoogleWatchError', () => {
  it('should map a permanent 403 to a forbidden subscription exception', () => {
    const error = createWatchError(
      403,
      'required',
      'The user must be signed up for Google Calendar.',
    );

    const parsedError = parseGoogleWatchError(error);

    expect(parsedError).toBeInstanceOf(WebhookSubscriptionDriverException);
    expect((parsedError as WebhookSubscriptionDriverException).code).toBe(
      WebhookSubscriptionDriverExceptionCode.SUBSCRIPTION_FORBIDDEN,
    );
  });

  it.each(['rateLimitExceeded', 'userRateLimitExceeded'])(
    'should keep the original error for 403 %s',
    (reason) => {
      const error = createWatchError(403, reason, 'Rate limit exceeded');

      expect(parseGoogleWatchError(error)).toBe(error);
    },
  );

  it('should keep the original error for non-403 statuses', () => {
    const error = createWatchError(500, 'backendError', 'Backend error');

    expect(parseGoogleWatchError(error)).toBe(error);
  });
});
