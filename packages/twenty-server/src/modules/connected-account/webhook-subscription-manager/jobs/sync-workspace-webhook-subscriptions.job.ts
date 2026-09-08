import { assertUnreachable } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceWebhookSubscriptionService } from 'src/modules/connected-account/webhook-subscription-manager/services/workspace-webhook-subscription.service';
import { type WorkspaceWebhookSubscriptionAction } from 'src/modules/connected-account/webhook-subscription-manager/types/workspace-webhook-subscription-action.type';

export type SyncWorkspaceWebhookSubscriptionsJobData = {
  workspaceId: string;
  action: WorkspaceWebhookSubscriptionAction;
};

@Processor(MessageQueue.webhookQueue)
export class SyncWorkspaceWebhookSubscriptionsJob {
  constructor(
    private readonly workspaceWebhookSubscriptionService: WorkspaceWebhookSubscriptionService,
  ) {}

  @Process(SyncWorkspaceWebhookSubscriptionsJob.name)
  async handle({
    workspaceId,
    action,
  }: SyncWorkspaceWebhookSubscriptionsJobData): Promise<void> {
    switch (action) {
      case 'REVOKE':
        await this.workspaceWebhookSubscriptionService.enqueueRevocations(
          workspaceId,
        );

        return;
      case 'CREATE':
        await this.workspaceWebhookSubscriptionService.enqueueCreations(
          workspaceId,
        );

        return;
      default:
        return assertUnreachable(action);
    }
  }
}
