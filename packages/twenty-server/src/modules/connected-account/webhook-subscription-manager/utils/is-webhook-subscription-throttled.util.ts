import { isDefined } from 'twenty-shared/utils';

import { WEBHOOK_SUBSCRIPTION_THROTTLE_DURATION } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-throttle-duration.constant';
import { WEBHOOK_SUBSCRIPTION_THROTTLE_MAX_PAUSE } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-throttle-max-pause.constant';

export const isWebhookSubscriptionThrottled = (
  webhookSubscriptionFailedAt: Date | null,
  webhookSubscriptionFailureCount: number,
): boolean => {
  if (!isDefined(webhookSubscriptionFailedAt)) {
    return false;
  }

  if (webhookSubscriptionFailureCount === 0) {
    return false;
  }

  const throttlePauseUntil = computeThrottlePauseUntil(
    webhookSubscriptionFailedAt,
    webhookSubscriptionFailureCount,
  );

  return throttlePauseUntil > new Date();
};

const computeThrottlePauseUntil = (
  webhookSubscriptionFailedAt: Date,
  webhookSubscriptionFailureCount: number,
): Date => {
  const pause = Math.min(
    WEBHOOK_SUBSCRIPTION_THROTTLE_DURATION *
      Math.pow(2, webhookSubscriptionFailureCount - 1),
    WEBHOOK_SUBSCRIPTION_THROTTLE_MAX_PAUSE,
  );

  return new Date(webhookSubscriptionFailedAt.getTime() + pause);
};
