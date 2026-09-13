import { type WebhookSubscriptionSyncAction } from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-sync-action.type';

export type SyncWorkspaceWebhookSubscriptionsJobData = {
  workspaceId: string;
  action: WebhookSubscriptionSyncAction;
};
