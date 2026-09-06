import { type Repository } from 'typeorm';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { CalendarEventWebhookSyncJob } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/jobs/calendar-event-webhook-sync.job';
import { CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_CACHE_TTL_MS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-debounce-cache-ttl-ms.constant';
import { CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_MS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-debounce-ms.constant';
import { WebhookSyncTriggerService } from 'src/modules/connected-account/webhook-subscription-manager/services/webhook-sync-trigger.service';

describe('WebhookSyncTriggerService', () => {
  it('debounces calendar notifications before scheduling the webhook sync', async () => {
    const connectedAccountSyncWebhookQueueService = { add: jest.fn() };
    const cacheStorage = { set: jest.fn() };
    const service = new WebhookSyncTriggerService(
      {} as MessageQueueService,
      connectedAccountSyncWebhookQueueService as unknown as MessageQueueService,
      cacheStorage as unknown as CacheStorageService,
      {} as Repository<MessageChannelEntity>,
    );

    await service.triggerCalendarSync('calendar-channel-id', 'workspace-id');

    const [, webhookEventId, cacheTtl] = cacheStorage.set.mock.calls[0];

    expect(cacheStorage.set).toHaveBeenCalledWith(
      'calendar-event-webhook-sync-debounce:workspace-id:calendar-channel-id',
      webhookEventId,
      CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_CACHE_TTL_MS,
    );
    expect(connectedAccountSyncWebhookQueueService.add).toHaveBeenCalledWith(
      CalendarEventWebhookSyncJob.name,
      {
        calendarChannelId: 'calendar-channel-id',
        webhookEventId,
        workspaceId: 'workspace-id',
      },
      expect.objectContaining({
        delay: CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_MS,
      }),
    );
    expect(
      connectedAccountSyncWebhookQueueService.add.mock.invocationCallOrder[0],
    ).toBeLessThan(cacheStorage.set.mock.invocationCallOrder[0]);
    expect(cacheTtl).toBe(CALENDAR_EVENT_WEBHOOK_SYNC_DEBOUNCE_CACHE_TTL_MS);
  });

  it('does not replace the latest token when queueing fails', async () => {
    const connectedAccountSyncWebhookQueueService = {
      add: jest.fn().mockRejectedValue(new Error('Queue unavailable')),
    };
    const cacheStorage = { set: jest.fn() };
    const service = new WebhookSyncTriggerService(
      {} as MessageQueueService,
      connectedAccountSyncWebhookQueueService as unknown as MessageQueueService,
      cacheStorage as unknown as CacheStorageService,
      {} as Repository<MessageChannelEntity>,
    );

    await expect(
      service.triggerCalendarSync('calendar-channel-id', 'workspace-id'),
    ).rejects.toThrow('Queue unavailable');

    expect(cacheStorage.set).not.toHaveBeenCalled();
  });

  it('clears a stale token when storing the new token fails', async () => {
    const connectedAccountSyncWebhookQueueService = { add: jest.fn() };
    const cacheStorage = {
      set: jest.fn().mockRejectedValue(new Error('Cache unavailable')),
      del: jest.fn().mockResolvedValue(undefined),
    };
    const service = new WebhookSyncTriggerService(
      {} as MessageQueueService,
      connectedAccountSyncWebhookQueueService as unknown as MessageQueueService,
      cacheStorage as unknown as CacheStorageService,
      {} as Repository<MessageChannelEntity>,
    );

    await expect(
      service.triggerCalendarSync('calendar-channel-id', 'workspace-id'),
    ).rejects.toThrow('Cache unavailable');

    expect(cacheStorage.del).toHaveBeenCalledWith(
      'calendar-event-webhook-sync-debounce:workspace-id:calendar-channel-id',
    );
  });
});
