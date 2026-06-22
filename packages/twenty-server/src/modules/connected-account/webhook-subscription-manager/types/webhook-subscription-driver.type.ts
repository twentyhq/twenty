import { type ConnectedAccountWebhookSubscriptionEntity } from 'src/engine/metadata-modules/connected-account-webhook-subscription/entities/connected-account-webhook-subscription.entity';
import { type WebhookSubscriptionChannelType } from 'src/engine/metadata-modules/connected-account-webhook-subscription/enums/webhook-subscription-channel-type.enum';

export type WebhookSubscriptionResult = {
  externalSubscriptionId: string | null;
  externalResourceId: string | null;
  expiresAt: Date;
};

export type WebhookSubscriptionDriver = {
  createSubscription(
    connectedAccountId: string,
    channelType: WebhookSubscriptionChannelType,
    clientState: string,
  ): Promise<WebhookSubscriptionResult>;

  renewSubscription(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
  ): Promise<WebhookSubscriptionResult>;

  deleteSubscription(
    subscription: ConnectedAccountWebhookSubscriptionEntity,
  ): Promise<void>;
};
