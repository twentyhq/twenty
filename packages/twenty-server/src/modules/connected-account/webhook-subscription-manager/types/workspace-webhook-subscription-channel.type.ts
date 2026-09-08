import { WebhookSubscriptionChannelType } from 'twenty-shared/types';

export type WorkspaceWebhookSubscriptionChannel = {
  channelType: WebhookSubscriptionChannelType;
  channelId: string;
  workspaceId: string;
};
