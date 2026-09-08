import { type WorkspaceWebhookSubscriptionAction } from 'src/modules/connected-account/webhook-subscription-manager/types/workspace-webhook-subscription-action.type';

export type SyncWorkspaceWebhookSubscriptionsJobData = {
  workspaceId: string;
  action: WorkspaceWebhookSubscriptionAction;
};
