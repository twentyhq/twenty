import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { CalendarEventImportErrorHandlerService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import { CalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';

jest.mock(
  'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator',
  () => ({
    InjectCacheStorage: () => () => undefined,
  }),
);

const connectedAccount = { id: 'connected-account-1' } as never;

const calendarChannelActiveSyncCursor = {
  id: 'calendar-channel-1',
  syncCursor: 'existing-sync-token',
} as CalendarChannelEntity;

const calendarChannelNoSyncCursor = {
  id: 'calendar-channel-1',
  syncCursor: null,
} as unknown as CalendarChannelEntity;

describe('CalendarFetchEventsService', () => {
  let service: CalendarFetchEventsService;
  const associationFind = jest.fn();
  const associationDelete = jest.fn();
  const getCalendarEvents = jest.fn();
  const cleanWorkspaceCalendarEvents = jest.fn();
  const markAsCalendarEventListFetchOngoing = jest.fn();
  const markAsCalendarEventsImportPending = jest.fn();
  const markAsCalendarEventSyncCompleted = jest.fn();
  const calendarChannelRepositoryUpdate = jest.fn();
  const getRepository = jest.fn();

  beforeEach(async () => {
    getRepository.mockResolvedValue({
      find: associationFind,
      delete: associationDelete,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarFetchEventsService,
        {
          provide: CacheStorageService,
          useValue: { setAdd: jest.fn(), setPop: jest.fn(), del: jest.fn() },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: (fn: () => unknown) => fn(),
            getRepository,
          },
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: { update: calendarChannelRepositoryUpdate },
        },
        {
          provide: CalendarChannelSyncStatusService,
          useValue: {
            markAsCalendarEventListFetchOngoing,
            markAsCalendarEventsImportPending,
            markAsCalendarEventSyncCompleted,
          },
        },
        {
          provide: CalendarGetCalendarEventsService,
          useValue: { getCalendarEvents },
        },
        {
          provide: CalendarEventImportErrorHandlerService,
          useValue: { handleDriverException: jest.fn() },
        },
        {
          provide: CalendarEventCleanerService,
          useValue: { cleanWorkspaceCalendarEvents },
        },
      ],
    }).compile();

    service = module.get(CalendarFetchEventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deletes only the ids Google flagged as cancelled during an incremental sync', async () => {
    associationFind.mockResolvedValue([]);
    getCalendarEvents.mockResolvedValue({
      calendarEventIds: ['event-kept'],
      calendarEventIdsToDelete: ['event-cancelled'],
      nextSyncCursor: 'new-sync-token',
    });

    await service.fetchCalendarEvents(
      calendarChannelActiveSyncCursor,
      connectedAccount,
      'workspace-1',
    );

    expect(associationFind).not.toHaveBeenCalled();
    expect(associationDelete).toHaveBeenCalledWith({
      eventExternalId: expect.anything(),
      calendarChannelId: 'calendar-channel-1',
    });
    expect(cleanWorkspaceCalendarEvents).toHaveBeenCalledWith('workspace-1');
  });

  it('reconciles stale local events against a full sync, even though Google never flags them as cancelled', async () => {
    // Real Google Calendar behavior (measured against the Veris sandbox): a
    // full sync (no syncToken) only returns events that still exist. An
    // event deleted during a sync gap is simply absent, never returned with
    // status "cancelled". Without this reconciliation, that event would
    // never be identified as deleted and would remain in Twenty forever.
    associationFind.mockResolvedValue([
      { eventExternalId: 'event-still-exists' },
      { eventExternalId: 'event-deleted-while-stale' },
    ]);
    getCalendarEvents.mockResolvedValue({
      calendarEventIds: ['event-still-exists'],
      calendarEventIdsToDelete: [],
      nextSyncCursor: 'new-sync-token',
    });

    await service.fetchCalendarEvents(
      calendarChannelNoSyncCursor,
      connectedAccount,
      'workspace-1',
    );

    expect(associationFind).toHaveBeenCalledWith({
      where: { calendarChannelId: 'calendar-channel-1' },
    });
    expect(associationDelete).toHaveBeenCalledWith({
      eventExternalId: expect.anything(),
      calendarChannelId: 'calendar-channel-1',
    });

    const deleteCallArgument = associationDelete.mock.calls[0][0];

    expect(deleteCallArgument.eventExternalId.value).toEqual([
      'event-deleted-while-stale',
    ]);
  });

  it('does not reconcile against local state on an incremental sync', async () => {
    getCalendarEvents.mockResolvedValue({
      calendarEventIds: ['event-kept'],
      calendarEventIdsToDelete: [],
      nextSyncCursor: 'new-sync-token',
    });

    await service.fetchCalendarEvents(
      calendarChannelActiveSyncCursor,
      connectedAccount,
      'workspace-1',
    );

    expect(associationFind).not.toHaveBeenCalled();
    expect(associationDelete).not.toHaveBeenCalled();
  });
});
