import { Scope } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-initial-delay-ms.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_LIMIT } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-retry-limit.constant';
import { CalendarEventWebhookSyncService } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/services/calendar-event-webhook-sync.service';
import { getCalendarEventWebhookSyncDebounceCacheKey } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/utils/get-calendar-event-webhook-sync-debounce-cache-key.util';

export type CalendarEventWebhookSyncJobData = {
  calendarChannelId: string;
  workspaceId: string;
  retryAttempt?: number;
  webhookEventId?: string;
};

const CALENDAR_EVENT_WEBHOOK_SYNC_MAX_RETRY_DELAY_MS = 60_000;

@Processor({
  queueName: MessageQueue.connectedAccountSyncWebhookQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventWebhookSyncJob {
  constructor(
    private readonly calendarEventWebhookSyncService: CalendarEventWebhookSyncService,
    @InjectMessageQueue(MessageQueue.connectedAccountSyncWebhookQueue)
    private readonly connectedAccountSyncWebhookQueueService: MessageQueueService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  @Process(CalendarEventWebhookSyncJob.name)
  async handle(data: CalendarEventWebhookSyncJobData): Promise<void> {
    const latestWebhookEventId = await this.cacheStorage.get<string>(
      getCalendarEventWebhookSyncDebounceCacheKey(data),
    );

    if (
      latestWebhookEventId !== undefined &&
      latestWebhookEventId !== data.webhookEventId
    ) {
      return;
    }

    const { shouldRetry } =
      await this.calendarEventWebhookSyncService.processCalendarEventWebhookSync(
        data,
      );

    if (!shouldRetry) {
      return;
    }

    await this.connectedAccountSyncWebhookQueueService.add<CalendarEventWebhookSyncJobData>(
      CalendarEventWebhookSyncJob.name,
      {
        calendarChannelId: data.calendarChannelId,
        workspaceId: data.workspaceId,
        retryAttempt: (data.retryAttempt ?? 0) + 1,
        webhookEventId: data.webhookEventId,
      },
      {
        id: `${CalendarEventWebhookSyncJob.name}-${data.calendarChannelId}`,
        delay: this.getRetryDelay(data.retryAttempt ?? 0),
        retryLimit: CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_LIMIT,
        backoff: {
          strategy: 'exponential',
          initialDelayMilliseconds:
            CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS,
        },
      },
    );
  }

  private getRetryDelay(retryAttempt: number): number {
    return Math.min(
      CALENDAR_EVENT_WEBHOOK_SYNC_RETRY_INITIAL_DELAY_MS * 2 ** retryAttempt,
      CALENDAR_EVENT_WEBHOOK_SYNC_MAX_RETRY_DELAY_MS,
    );
  }
}
