import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WORKSPACE_REACTIVATED_EVENT } from 'src/engine/core-modules/workspace/constants/workspace-reactivated-event.constant';
import { WORKSPACE_SOFT_DELETED_EVENT } from 'src/engine/core-modules/workspace/constants/workspace-soft-deleted-event.constant';
import { WORKSPACE_SUSPENDED_EVENT } from 'src/engine/core-modules/workspace/constants/workspace-suspended-event.constant';
import { type WorkspaceReactivatedEvent } from 'src/engine/core-modules/workspace/types/workspace-reactivated-event.type';
import { type WorkspaceSoftDeletedEvent } from 'src/engine/core-modules/workspace/types/workspace-soft-deleted-event.type';
import { type WorkspaceSuspendedEvent } from 'src/engine/core-modules/workspace/types/workspace-suspended-event.type';
import { WEBHOOK_SUBSCRIPTION_JOB_RETRY_LIMIT } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-job-retry-limit.constant';
import { SyncWorkspaceWebhookSubscriptionsJob } from 'src/modules/connected-account/webhook-subscription-manager/jobs/sync-workspace-webhook-subscriptions.job';
import { type SyncWorkspaceWebhookSubscriptionsJobData } from 'src/modules/connected-account/webhook-subscription-manager/types/sync-workspace-webhook-subscriptions-job-data.type';
import { type WebhookSubscriptionSyncAction } from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-sync-action.type';

@Injectable()
export class WebhookSubscriptionWorkspaceActivationListener {
  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly webhookQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @OnEvent(WORKSPACE_SUSPENDED_EVENT)
  async handleWorkspaceSuspended({
    workspaceId,
  }: WorkspaceSuspendedEvent): Promise<void> {
    await this.enqueueSync(workspaceId, 'REVOKE');
  }

  @OnEvent(WORKSPACE_SOFT_DELETED_EVENT)
  async handleWorkspaceSoftDeleted({
    workspaceId,
  }: WorkspaceSoftDeletedEvent): Promise<void> {
    await this.enqueueSync(workspaceId, 'REVOKE');
  }

  @OnEvent(WORKSPACE_REACTIVATED_EVENT)
  async handleWorkspaceReactivated({
    workspaceId,
  }: WorkspaceReactivatedEvent): Promise<void> {
    await this.enqueueSync(workspaceId, 'CREATE');
  }

  private async enqueueSync(
    workspaceId: string,
    action: WebhookSubscriptionSyncAction,
  ): Promise<void> {
    await this.webhookQueueService
      .add<SyncWorkspaceWebhookSubscriptionsJobData>(
        SyncWorkspaceWebhookSubscriptionsJob.name,
        { workspaceId, action },
        { retryLimit: WEBHOOK_SUBSCRIPTION_JOB_RETRY_LIMIT },
      )
      .catch((error) =>
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: workspaceId },
        }),
      );
  }
}
