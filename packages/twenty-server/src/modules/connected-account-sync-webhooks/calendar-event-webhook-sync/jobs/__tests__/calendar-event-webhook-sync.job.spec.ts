import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarEventWebhookSyncJob } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/jobs/calendar-event-webhook-sync.job';
import { type CalendarEventWebhookSyncService } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/services/calendar-event-webhook-sync.service';

describe('CalendarEventWebhookSyncJob', () => {
  it('schedules one delayed sync attempt when another sync is in progress', async () => {
    const calendarEventWebhookSyncService = {
      processCalendarEventWebhookSync: jest
        .fn()
        .mockResolvedValue({ shouldRetry: true }),
    };
    const connectedAccountSyncWebhookQueueService = { add: jest.fn() };
    const cacheStorage = {
      mget: jest.fn().mockResolvedValue(['most-recent-webhook-event-id']),
    };
    const job = new CalendarEventWebhookSyncJob(
      calendarEventWebhookSyncService as unknown as CalendarEventWebhookSyncService,
      connectedAccountSyncWebhookQueueService as unknown as MessageQueueService,
      cacheStorage as unknown as CacheStorageService,
    );

    await job.handle({
      calendarChannelId: 'calendar-channel-id',
      workspaceId: 'workspace-id',
    });

    expect(connectedAccountSyncWebhookQueueService.add).toHaveBeenCalledWith(
      CalendarEventWebhookSyncJob.name,
      {
        calendarChannelId: 'calendar-channel-id',
        workspaceId: 'workspace-id',
        retryAttempt: 1,
      },
      expect.objectContaining({
        delay: 5_000,
      }),
    );
  });

  it('does not schedule another attempt after a sync completes', async () => {
    const calendarEventWebhookSyncService = {
      processCalendarEventWebhookSync: jest
        .fn()
        .mockResolvedValue({ shouldRetry: false }),
    };
    const connectedAccountSyncWebhookQueueService = { add: jest.fn() };
    const cacheStorage = { mget: jest.fn().mockResolvedValue([undefined]) };
    const job = new CalendarEventWebhookSyncJob(
      calendarEventWebhookSyncService as unknown as CalendarEventWebhookSyncService,
      connectedAccountSyncWebhookQueueService as unknown as MessageQueueService,
      cacheStorage as unknown as CacheStorageService,
    );

    await job.handle({
      calendarChannelId: 'calendar-channel-id',
      workspaceId: 'workspace-id',
    });

    expect(connectedAccountSyncWebhookQueueService.add).not.toHaveBeenCalled();
  });

  it('processes the most recent webhook notification', async () => {
    const calendarEventWebhookSyncService = {
      processCalendarEventWebhookSync: jest
        .fn()
        .mockResolvedValue({ shouldRetry: false }),
    };
    const connectedAccountSyncWebhookQueueService = { add: jest.fn() };
    const cacheStorage = {
      mget: jest.fn().mockResolvedValue(['most-recent-webhook-event-id']),
    };
    const job = new CalendarEventWebhookSyncJob(
      calendarEventWebhookSyncService as unknown as CalendarEventWebhookSyncService,
      connectedAccountSyncWebhookQueueService as unknown as MessageQueueService,
      cacheStorage as unknown as CacheStorageService,
    );

    await job.handle({
      calendarChannelId: 'calendar-channel-id',
      workspaceId: 'workspace-id',
      webhookEventId: 'most-recent-webhook-event-id',
    });

    expect(
      calendarEventWebhookSyncService.processCalendarEventWebhookSync,
    ).toHaveBeenCalledWith({
      calendarChannelId: 'calendar-channel-id',
      workspaceId: 'workspace-id',
      webhookEventId: 'most-recent-webhook-event-id',
    });
  });

  it('processes a notification when no debounce token is available', async () => {
    const calendarEventWebhookSyncService = {
      processCalendarEventWebhookSync: jest
        .fn()
        .mockResolvedValue({ shouldRetry: false }),
    };
    const connectedAccountSyncWebhookQueueService = { add: jest.fn() };
    const cacheStorage = { mget: jest.fn().mockResolvedValue([undefined]) };
    const job = new CalendarEventWebhookSyncJob(
      calendarEventWebhookSyncService as unknown as CalendarEventWebhookSyncService,
      connectedAccountSyncWebhookQueueService as unknown as MessageQueueService,
      cacheStorage as unknown as CacheStorageService,
    );

    await job.handle({
      calendarChannelId: 'calendar-channel-id',
      workspaceId: 'workspace-id',
      webhookEventId: 'webhook-event-id',
    });

    expect(
      calendarEventWebhookSyncService.processCalendarEventWebhookSync,
    ).toHaveBeenCalled();
  });

  it('does not process an outdated webhook notification', async () => {
    const calendarEventWebhookSyncService = {
      processCalendarEventWebhookSync: jest.fn(),
    };
    const connectedAccountSyncWebhookQueueService = { add: jest.fn() };
    const cacheStorage = {
      mget: jest.fn().mockResolvedValue(['most-recent-webhook-event-id']),
    };
    const job = new CalendarEventWebhookSyncJob(
      calendarEventWebhookSyncService as unknown as CalendarEventWebhookSyncService,
      connectedAccountSyncWebhookQueueService as unknown as MessageQueueService,
      cacheStorage as unknown as CacheStorageService,
    );

    await job.handle({
      calendarChannelId: 'calendar-channel-id',
      workspaceId: 'workspace-id',
      webhookEventId: 'outdated-webhook-event-id',
    });

    expect(
      calendarEventWebhookSyncService.processCalendarEventWebhookSync,
    ).not.toHaveBeenCalled();
  });
});
