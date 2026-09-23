import { WebhookSubscriptionChannelType } from 'twenty-shared/types';

export type WebhookSubscriptionChannelReference = {
  channelType: WebhookSubscriptionChannelType;
  channelId: string;
  workspaceId: string;
};
