import { WebhookSubscriptionStatus } from 'twenty-shared/types';

export const REVOCABLE_WEBHOOK_SUBSCRIPTION_STATUSES: WebhookSubscriptionStatus[] =
  [
    WebhookSubscriptionStatus.ACTIVE,
    WebhookSubscriptionStatus.FAILED,
    WebhookSubscriptionStatus.EXPIRED,
    WebhookSubscriptionStatus.PENDING,
  ];
