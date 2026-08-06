import { WEBHOOK_SUBSCRIPTION_THROTTLE_DURATION } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-throttle-duration.constant';
import { isWebhookSubscriptionThrottled } from 'src/modules/connected-account/webhook-subscription-manager/utils/is-webhook-subscription-throttled.util';

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000);

const hoursAgo = (hours: number) => minutesAgo(hours * 60);

describe('isWebhookSubscriptionThrottled', () => {
  it('should not throttle when the subscription has never failed', () => {
    expect(isWebhookSubscriptionThrottled(null, 0)).toBe(false);
  });

  it('should not throttle when there have been no failures', () => {
    expect(isWebhookSubscriptionThrottled(minutesAgo(1), 0)).toBe(false);
  });

  it('should throttle while the backoff window of the first failure is open', () => {
    expect(isWebhookSubscriptionThrottled(minutesAgo(1), 1)).toBe(true);
  });

  it('should stop throttling once the backoff window of the first failure has elapsed', () => {
    expect(isWebhookSubscriptionThrottled(hoursAgo(2), 1)).toBe(false);
  });

  it('should double the backoff window on every failure', () => {
    expect(isWebhookSubscriptionThrottled(hoursAgo(3), 3)).toBe(true);
    expect(isWebhookSubscriptionThrottled(hoursAgo(5), 3)).toBe(false);
  });

  it('should cap the backoff window so retries fit within the renewal buffer', () => {
    expect(isWebhookSubscriptionThrottled(hoursAgo(9), 5)).toBe(false);
    expect(isWebhookSubscriptionThrottled(hoursAgo(7), 5)).toBe(true);
  });

  it('should throttle for the full duration of the last failure', () => {
    const justInsideWindow = new Date(
      Date.now() - WEBHOOK_SUBSCRIPTION_THROTTLE_DURATION + 60 * 1000,
    );
    const justOutsideWindow = new Date(
      Date.now() - WEBHOOK_SUBSCRIPTION_THROTTLE_DURATION - 60 * 1000,
    );

    expect(isWebhookSubscriptionThrottled(justInsideWindow, 1)).toBe(true);
    expect(isWebhookSubscriptionThrottled(justOutsideWindow, 1)).toBe(false);
  });
});
