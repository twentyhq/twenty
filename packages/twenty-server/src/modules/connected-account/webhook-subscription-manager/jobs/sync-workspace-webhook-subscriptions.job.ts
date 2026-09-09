import { assertUnreachable } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WebhookSubscriptionWorkspaceSyncService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-subscription-workspace-sync.service';
import { type SyncWorkspaceWebhookSubscriptionsJobData } from 'src/modules/connected-account/webhook-subscription-manager/types/sync-workspace-webhook-subscriptions-job-data.type';

@Processor(MessageQueue.webhookQueue)
export class SyncWorkspaceWebhookSubscriptionsJob {
  constructor(
    private readonly webhookSubscriptionWorkspaceSyncService: WebhookSubscriptionWorkspaceSyncService,
  ) {}

  @Process(SyncWorkspaceWebhookSubscriptionsJob.name)
  async handle({
    workspaceId,
    action,
  }: SyncWorkspaceWebhookSubscriptionsJobData): Promise<void> {
    switch (action) {
      case 'REVOKE':
        await this.webhookSubscriptionWorkspaceSyncService.enqueueRevocations(
          workspaceId,
        );

        return;
      case 'CREATE':
        await this.webhookSubscriptionWorkspaceSyncService.enqueueCreations(
          workspaceId,
        );

        return;
      default:
        return assertUnreachable(action);
    }
  }
}
