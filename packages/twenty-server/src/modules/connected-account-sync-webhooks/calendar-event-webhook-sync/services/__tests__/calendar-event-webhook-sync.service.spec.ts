import { type Repository } from 'typeorm';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { type CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import { CalendarEventWebhookSyncService } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/services/calendar-event-webhook-sync.service';

describe('CalendarEventWebhookSyncService', () => {
  it('requests a retry when another sync already owns the calendar channel', async () => {
    const execute = jest.fn().mockResolvedValue({ raw: [] });
    const calendarChannelRepository = {
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute,
      })),
      findOne: jest.fn().mockResolvedValue({
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
      }),
    };
    const calendarFetchEventsService = { fetchCalendarEvents: jest.fn() };
    const calendarEventsImportService = {
      processCalendarEventsImport: jest.fn(),
    };
    const service = new CalendarEventWebhookSyncService(
      {} as CacheStorageService,
      calendarChannelRepository as unknown as Repository<CalendarChannelEntity>,
      calendarFetchEventsService as unknown as CalendarFetchEventsService,
      calendarEventsImportService as unknown as CalendarEventsImportService,
    );

    await expect(
      service.processCalendarEventWebhookSync({
        calendarChannelId: 'calendar-channel-id',
        workspaceId: 'workspace-id',
      }),
    ).resolves.toEqual({ shouldRetry: true });

    expect(
      calendarFetchEventsService.fetchCalendarEvents,
    ).not.toHaveBeenCalled();
    expect(
      calendarEventsImportService.processCalendarEventsImport,
    ).not.toHaveBeenCalled();
  });

  it('does not retry a webhook sync while the channel is throttled', async () => {
    const execute = jest.fn().mockResolvedValue({ raw: [] });
    const calendarChannelRepository = {
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute,
      })),
      findOne: jest.fn().mockResolvedValue({
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        syncStageStartedAt: new Date(),
        throttleFailureCount: 1,
      }),
    };
    const service = new CalendarEventWebhookSyncService(
      {} as CacheStorageService,
      calendarChannelRepository as unknown as Repository<CalendarChannelEntity>,
      {} as CalendarFetchEventsService,
      {} as CalendarEventsImportService,
    );

    await expect(
      service.processCalendarEventWebhookSync({
        calendarChannelId: 'calendar-channel-id',
        workspaceId: 'workspace-id',
      }),
    ).resolves.toEqual({ shouldRetry: false });

    expect(execute).not.toHaveBeenCalled();
  });

  it('retries a webhook sync while another throttled sync is still active', async () => {
    const execute = jest.fn().mockResolvedValue({ raw: [] });
    const calendarChannelRepository = {
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute,
      })),
      findOne: jest.fn().mockResolvedValue({
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
        syncStageStartedAt: new Date(),
        throttleFailureCount: 1,
      }),
    };
    const service = new CalendarEventWebhookSyncService(
      {} as CacheStorageService,
      calendarChannelRepository as unknown as Repository<CalendarChannelEntity>,
      {} as CalendarFetchEventsService,
      {} as CalendarEventsImportService,
    );

    await expect(
      service.processCalendarEventWebhookSync({
        calendarChannelId: 'calendar-channel-id',
        workspaceId: 'workspace-id',
      }),
    ).resolves.toEqual({ shouldRetry: true });
  });
});
