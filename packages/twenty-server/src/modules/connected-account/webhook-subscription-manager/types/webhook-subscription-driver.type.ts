import { type WebhookSubscriptionChannelType } from 'twenty-shared/types';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

export type WebhookSubscribableChannel =
  | MessageChannelEntity
  | CalendarChannelEntity;

export type WebhookSubscriptionOperation = 'CREATE' | 'RENEW';

export type WebhookSubscriptionRecoveryAction = 'NONE' | 'RECREATE';

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
