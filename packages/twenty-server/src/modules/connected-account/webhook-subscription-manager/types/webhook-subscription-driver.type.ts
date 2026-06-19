import {
  type ConnectedAccountWebhookSubscriptionEntity,
  type WebhookSubscriptionChannelType,
} from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';

export type WebhookSubscriptionDriverInput = {
  connectedAccountId: string;
  workspaceId: string;
  handle: string;
  channelId: string;
  channelType: WebhookSubscriptionChannelType;
  clientState: string;
};

export type WebhookSubscriptionResult = {
  externalSubscriptionId: string | null;
  externalResourceId: string | null;
  expiresAt: Date;
};

export type WebhookSubscriptionDriver = {
  createSubscription(
    input: WebhookSubscriptionDriverInput,
  ): Promise<WebhookSubscriptionResult>;

  renewSubscription(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
    input: WebhookSubscriptionDriverInput,
  ): Promise<WebhookSubscriptionResult>;

  deleteSubscription(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
    input: WebhookSubscriptionDriverInput,
  ): Promise<void>;
};
