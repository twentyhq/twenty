import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageChannelSyncStage } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceActivationService } from 'src/modules/connected-account/webhook-subscription-manager/services/workspace-activation.service';
import {
  CalendarEventWebhookSyncJob,
  type CalendarEventWebhookSyncJobData,
} from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/jobs/calendar-event-webhook-sync.job';
import { CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_MS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-debounce-ms.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_JOB_OPTIONS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-job-options.constant';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

@Injectable()
export class WebhookSyncTriggerService {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messagingQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.connectedAccountSyncWebhookQueue)
    private readonly connectedAccountSyncWebhookQueueService: MessageQueueService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly workspaceActivationService: WorkspaceActivationService,
  ) {}

  async triggerMessagingSync(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    if (
      await this.workspaceActivationService.isWorkspaceDeactivated(workspaceId)
    ) {
      return;
    }

    const updateResult = await this.messageChannelRepository
      .createQueryBuilder()
      .update()
      .set({
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
        syncStageStartedAt: new Date(),
      })
      .where({
        id: messageChannelId,
        workspaceId,
        isSyncEnabled: true,
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      })
      .returning('id')
      .execute();

    if (updateResult.raw.length === 0) {
      return;
    }

    try {
      await this.messagingQueueService.add<MessagingMessageListFetchJobData>(
        MessagingMessageListFetchJob.name,
        { workspaceId, messageChannelId },
      );
    } catch (error) {
      await this.messageChannelRepository
        .createQueryBuilder()
        .update()
        .set({
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        })
        .where({
          id: messageChannelId,
          workspaceId,
        })
        .execute();

      throw error;
    }
  }

  async triggerCalendarSync(
    calendarChannelId: string,
    workspaceId: string,
  ): Promise<void> {
    if (
      await this.workspaceActivationService.isWorkspaceDeactivated(workspaceId)
    ) {
      return;
    }

    const debounceCacheKey = `calendar-event-webhook-sync-debounce:${workspaceId}:${calendarChannelId}`;

    const hasOpenedDebounceWindow = await this.cacheStorage.setIfAbsent(
      debounceCacheKey,
      true,
      CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_MS,
    );

    if (!hasOpenedDebounceWindow) {
      return;
    }

    try {
      await this.connectedAccountSyncWebhookQueueService.add<CalendarEventWebhookSyncJobData>(
        CalendarEventWebhookSyncJob.name,
        { workspaceId, calendarChannelId },
        {
          delay: CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_MS,
          ...CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_JOB_OPTIONS,
        },
      );
    } catch (error) {
      await this.cacheStorage.del(debounceCacheKey);

      throw error;
    }
  }
}
