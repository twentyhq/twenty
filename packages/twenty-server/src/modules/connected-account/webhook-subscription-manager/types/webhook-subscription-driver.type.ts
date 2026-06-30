import { type WebhookSubscriptionChannelType } from 'twenty-shared/types';

export type WebhookSubscriptionResult = {
  externalSubscriptionId: string | null;
  externalResourceId: string | null;
  expiresAt: Date;
};

export type WebhookSubscriptionContext = {
  connectedAccountId: string;
  channelType: WebhookSubscriptionChannelType;
  externalSubscriptionId: string | null;
  externalResourceId: string | null;
  clientState: string;
};

export type WebhookSubscriptionDriver = {
  createSubscription(
    connectedAccountId: string,
    channelType: WebhookSubscriptionChannelType,
    clientState: string,
  ): Promise<WebhookSubscriptionResult>;

  renewSubscription(
    context: WebhookSubscriptionContext,
  ): Promise<WebhookSubscriptionResult>;

  deleteSubscription(context: WebhookSubscriptionContext): Promise<void>;
};
