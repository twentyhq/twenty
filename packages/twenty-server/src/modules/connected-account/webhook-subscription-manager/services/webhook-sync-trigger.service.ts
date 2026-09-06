import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 } from 'uuid';

import { MessageChannelSyncStage } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  CalendarEventWebhookSyncJob,
  type CalendarEventWebhookSyncJobData,
} from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/jobs/calendar-event-webhook-sync.job';
import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-initial-delay-ms.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_LIMIT } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-limit.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_CACHE_TTL_MS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-debounce-cache-ttl-ms.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_MS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-debounce-ms.constant';
import { getCalendarEventWebhookSyncDebounceCacheKey } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/utils/get-calendar-event-webhook-sync-debounce-cache-key.util';
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
  ) {}

  async triggerMessagingSync(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<void> {
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
    const webhookEventId = v4();
    const debounceCacheKey = getCalendarEventWebhookSyncDebounceCacheKey({
      calendarChannelId,
      workspaceId,
    });

    await this.connectedAccountSyncWebhookQueueService.add<CalendarEventWebhookSyncJobData>(
      CalendarEventWebhookSyncJob.name,
      { workspaceId, calendarChannelId, webhookEventId },
      {
        delay: CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_MS,
        retryLimit: CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_LIMIT,
        backoff: {
          strategy: 'exponential',
          initialDelayMilliseconds:
            CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS,
        },
      },
    );

    try {
      await this.cacheStorage.set(
        debounceCacheKey,
        webhookEventId,
        CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_CACHE_TTL_MS,
      );
    } catch (error) {
      // Let the delayed job fetch instead of discarding itself against a stale token.
      await this.cacheStorage.del(debounceCacheKey).catch(() => undefined);

      throw error;
    }
  }
}
