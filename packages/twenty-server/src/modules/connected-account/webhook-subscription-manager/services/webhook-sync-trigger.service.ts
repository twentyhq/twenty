import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-sync-retry-initial-delay-ms.constant';
import { WEBHOOK_SYNC_RETRY_JITTER } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-sync-retry-jitter.constant';
import { WEBHOOK_SYNC_RETRY_LIMIT } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-sync-retry-limit.constant';
import { WorkspaceActivationService } from 'src/modules/connected-account/webhook-subscription-manager/services/workspace-activation.service';
import { CalendarEventWebhookSyncJob } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/jobs/calendar-event-webhook-sync.job';
import { type CalendarEventWebhookSyncJobData } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/types/calendar-event-webhook-sync-job-data.type';
import { MessagingMessageWebhookSyncJob } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/jobs/messaging-message-webhook-sync.job';
import { type MessagingMessageWebhookSyncJobData } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/types/messaging-message-webhook-sync-job-data.type';

@Injectable()
export class WebhookSyncTriggerService {
  constructor(
    @InjectMessageQueue(MessageQueue.connectedAccountSyncWebhookQueue)
    private readonly connectedAccountSyncWebhookQueueService: MessageQueueService,
    private readonly workspaceActivationService: WorkspaceActivationService,
  ) {}

  async triggerMessagingSync(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    const isWorkspaceServiceable =
      await this.workspaceActivationService.isWorkspaceServiceableFromCache(
        workspaceId,
      );

    if (!isWorkspaceServiceable) {
      return;
    }

    await this.connectedAccountSyncWebhookQueueService.add<MessagingMessageWebhookSyncJobData>(
      MessagingMessageWebhookSyncJob.name,
      { workspaceId, messageChannelId },
      {
        deduplication: {
          id: `messaging-message-webhook-sync:${workspaceId}:${messageChannelId}`,
          keepLastIfActive: true,
        },
        retryLimit: WEBHOOK_SYNC_RETRY_LIMIT,
        backoff: {
          strategy: 'exponential',
          initialDelayMilliseconds: WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS,
          jitter: WEBHOOK_SYNC_RETRY_JITTER,
        },
      },
    );
  }

  async triggerCalendarSync(
    calendarChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    const isWorkspaceServiceable =
      await this.workspaceActivationService.isWorkspaceServiceableFromCache(
        workspaceId,
      );

    if (!isWorkspaceServiceable) {
      return;
    }

    await this.connectedAccountSyncWebhookQueueService.add<CalendarEventWebhookSyncJobData>(
      CalendarEventWebhookSyncJob.name,
      { workspaceId, calendarChannelId },
      {
        deduplication: {
          id: `calendar-event-webhook-sync:${workspaceId}:${calendarChannelId}`,
          keepLastIfActive: true,
        },
        retryLimit: WEBHOOK_SYNC_RETRY_LIMIT,
        backoff: {
          strategy: 'exponential',
          initialDelayMilliseconds: WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS,
          jitter: WEBHOOK_SYNC_RETRY_JITTER,
        },
      },
    );
  }
}
