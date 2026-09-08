import { WebhookSubscriptionChannelType } from 'twenty-shared/types';

export type RevokeWebhookSubscriptionJobData = {
  channelType: WebhookSubscriptionChannelType;
  channelId: string;
  workspaceId: string;
};
