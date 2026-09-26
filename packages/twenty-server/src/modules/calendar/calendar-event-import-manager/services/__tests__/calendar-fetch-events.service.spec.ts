import {
  createInMemoryWorkspaceRepository,
  type InMemoryRecord,
} from 'test/utils/create-in-memory-workspace-repository.util';
import { type Repository } from 'typeorm';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { RECORD_DELETE_BATCH_SIZE } from 'src/engine/twenty-orm/constants/record-delete-batch-size.constant';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import {
  type CalendarEventImportErrorHandlerService,
  CalendarEventImportSyncStep,
} from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import { type CalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { type CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const CALENDAR_CHANNEL = {
  id: 'calendar-channel',
  syncCursor: 'sync-cursor',
} as CalendarChannelEntity;
const OTHER_CALENDAR_CHANNEL_ID = 'other-calendar-channel';
const NEXT_SYNC_CURSOR = 'next-sync-cursor';

const buildEventExternalIds = (count: number, prefix = 'cancelled') =>
  Array.from(
    { length: count },
    (_, index) => `${prefix}-${String(index).padStart(6, '0')}`,
  );

const buildAssociation = ({
  calendarChannelId = CALENDAR_CHANNEL.id,
  eventExternalId,
  deletedAt = null,
}: {
  calendarChannelId?: string;
  eventExternalId: string;
  deletedAt?: string | null;
}): InMemoryRecord => ({
  id: `${calendarChannelId}:${eventExternalId}`,
  calendarChannelId,
  eventExternalId,
  calendarEventId: `event-of-${eventExternalId}`,
  deletedAt,
});

const getIds = (records: InMemoryRecord[]) =>
  records.map(({ id }) => id).sort();

describe('CalendarFetchEventsService', () => {
  let service: CalendarFetchEventsService;
  let associationTable: ReturnType<typeof createInMemoryWorkspaceRepository>;
  let getCalendarEvents: jest.Mock;
  let deleteOrphanedCalendarEvents: jest.Mock;
  let handleDriverException: jest.Mock;
  let updateCalendarChannel: jest.Mock;
  let runInWorkspaceTransaction: jest.Mock;

  const setUp = ({
    calendarEventIdsToDelete,
    associations,
  }: {
    calendarEventIdsToDelete: string[];
    associations: InMemoryRecord[];
  }) => {
    associationTable = createInMemoryWorkspaceRepository(associations);
    getCalendarEvents.mockResolvedValue({
      calendarEventIds: [],
      calendarEventIdsToDelete,
      nextSyncCursor: NEXT_SYNC_CURSOR,
    });
  };

  const fetchCalendarEvents = () =>
    service.fetchCalendarEvents(
      CALENDAR_CHANNEL,
      {} as ConnectedAccountEntity,
      WORKSPACE_ID,
    );

  beforeEach(() => {
    runInWorkspaceTransaction = jest.fn(
      (work: (transactionScope: WorkspaceTransactionScope) => unknown) =>
        work({
          getRepository: () => associationTable.repository,
        } as unknown as WorkspaceTransactionScope),
    );
    getCalendarEvents = jest.fn();
    deleteOrphanedCalendarEvents = jest.fn();
    handleDriverException = jest.fn();
    updateCalendarChannel = jest.fn();

    service = new CalendarFetchEventsService(
      { setAdd: jest.fn() } as unknown as CacheStorageService,
      {
        executeInWorkspaceContext: jest.fn((callback: () => Promise<void>) =>
          callback(),
        ),
        getRepository: jest.fn(() => associationTable.repository),
        runInWorkspaceTransaction,
      } as unknown as WorkspaceOrmManager,
      {
        update: updateCalendarChannel,
      } as unknown as Repository<CalendarChannelEntity>,
      {
        markAsCalendarEventListFetchOngoing: jest.fn(),
        markAsCalendarEventsImportPending: jest.fn(),
        markAsCalendarEventSyncCompleted: jest.fn(),
      } as unknown as CalendarChannelSyncStatusService,
      { getCalendarEvents } as unknown as CalendarGetCalendarEventsService,
      {
        handleDriverException,
      } as unknown as CalendarEventImportErrorHandlerService,
      {
        deleteOrphanedCalendarEvents,
      } as unknown as CalendarEventCleanerService,
    );

    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  it('should delete the associations of cancelled events in batches of at most RECORD_DELETE_BATCH_SIZE', async () => {
    const cancelledEventExternalIds = buildEventExternalIds(
      2 * RECORD_DELETE_BATCH_SIZE + 300,
    );
    const importedCancelledEventExternalIds = cancelledEventExternalIds.slice(
      0,
      2 * RECORD_DELETE_BATCH_SIZE + 200,
    );
    const trashedAssociation = buildAssociation({
      eventExternalId:
        cancelledEventExternalIds[2 * RECORD_DELETE_BATCH_SIZE + 250],
      deletedAt: '2026-01-01T00:00:00.000Z',
    });
    const associationsToKeep = [
      ...buildEventExternalIds(5, 'active').map((eventExternalId) =>
        buildAssociation({ eventExternalId }),
      ),
      ...cancelledEventExternalIds.slice(0, 10).map((eventExternalId) =>
        buildAssociation({
          calendarChannelId: OTHER_CALENDAR_CHANNEL_ID,
          eventExternalId,
        }),
      ),
    ];
    const importedCancelledEventAssociations =
      importedCancelledEventExternalIds.map((eventExternalId) =>
        buildAssociation({ eventExternalId }),
      );

    setUp({
      calendarEventIdsToDelete: cancelledEventExternalIds,
      associations: [
        ...importedCancelledEventAssociations,
        trashedAssociation,
        ...associationsToKeep,
      ].reverse(),
    });

    await fetchCalendarEvents();

    const deletedIdsByCall = associationTable.getDeletedIdsByCall();

    expect(deletedIdsByCall.map((deletedIds) => deletedIds.length)).toEqual([
      RECORD_DELETE_BATCH_SIZE,
      RECORD_DELETE_BATCH_SIZE,
      201,
    ]);
    expect(deletedIdsByCall.flat().sort()).toEqual(
      getIds([...importedCancelledEventAssociations, trashedAssociation]),
    );
    expect(getIds(associationTable.getRecords())).toEqual(
      getIds(associationsToKeep),
    );
    expect(
      deleteOrphanedCalendarEvents.mock.calls.map(
        ([{ calendarEventIds }]) => calendarEventIds.length,
      ),
    ).toEqual([RECORD_DELETE_BATCH_SIZE, RECORD_DELETE_BATCH_SIZE, 200]);
    expect(runInWorkspaceTransaction).toHaveBeenCalledTimes(5);
    deleteOrphanedCalendarEvents.mock.invocationCallOrder.forEach(
      (orphanCleanupOrder, batchIndex) =>
        expect(orphanCleanupOrder).toBeGreaterThan(
          runInWorkspaceTransaction.mock.invocationCallOrder[batchIndex],
        ),
    );
    expect(
      deleteOrphanedCalendarEvents.mock.calls
        .flatMap(([{ calendarEventIds }]) => calendarEventIds)
        .sort(),
    ).toEqual(
      importedCancelledEventAssociations
        .map(({ calendarEventId }) => calendarEventId)
        .sort(),
    );
    expect(updateCalendarChannel).toHaveBeenCalledWith(
      { id: CALENDAR_CHANNEL.id, workspaceId: WORKSPACE_ID },
      { syncCursor: NEXT_SYNC_CURSOR },
    );
  });

  it('should keep each deletion within RECORD_DELETE_BATCH_SIZE when cancelled events have several associations', async () => {
    const cancelledEventExternalIds = buildEventExternalIds(
      RECORD_DELETE_BATCH_SIZE,
    );
    const liveAssociations = cancelledEventExternalIds.map((eventExternalId) =>
      buildAssociation({ eventExternalId }),
    );
    const trashedDuplicateAssociations = cancelledEventExternalIds.map(
      (eventExternalId) => ({
        ...buildAssociation({
          eventExternalId,
          deletedAt: '2026-01-01T00:00:00.000Z',
        }),
        id: `trashed-duplicate:${eventExternalId}`,
        calendarEventId: `trashed-event-of-${eventExternalId}`,
      }),
    );

    setUp({
      calendarEventIdsToDelete: cancelledEventExternalIds,
      associations: [...liveAssociations, ...trashedDuplicateAssociations],
    });

    await fetchCalendarEvents();

    const deletedIdsByCall = associationTable.getDeletedIdsByCall();

    expect(deletedIdsByCall.map((deletedIds) => deletedIds.length)).toEqual([
      RECORD_DELETE_BATCH_SIZE,
      RECORD_DELETE_BATCH_SIZE,
    ]);
    expect(deletedIdsByCall.flat().sort()).toEqual(
      getIds([...liveAssociations, ...trashedDuplicateAssociations]),
    );
    expect(associationTable.getRecords()).toHaveLength(0);
    expect(
      deleteOrphanedCalendarEvents.mock.calls
        .flatMap(([{ calendarEventIds }]) => calendarEventIds)
        .sort(),
    ).toEqual(
      liveAssociations.map(({ calendarEventId }) => calendarEventId).sort(),
    );
  });

  it('should not delete anything when the provider reports no cancelled event', async () => {
    const associations = buildEventExternalIds(5, 'active').map(
      (eventExternalId) => buildAssociation({ eventExternalId }),
    );

    setUp({ calendarEventIdsToDelete: [], associations });

    await fetchCalendarEvents();

    expect(associationTable.repository.delete).not.toHaveBeenCalled();
    expect(deleteOrphanedCalendarEvents).not.toHaveBeenCalled();
    expect(getIds(associationTable.getRecords())).toEqual(getIds(associations));
  });

  it('should hand a failed batch to the error handler without moving the sync cursor', async () => {
    const cancelledEventExternalIds = buildEventExternalIds(
      2 * RECORD_DELETE_BATCH_SIZE + 300,
    );

    setUp({
      calendarEventIdsToDelete: cancelledEventExternalIds,
      associations: cancelledEventExternalIds.map((eventExternalId) =>
        buildAssociation({ eventExternalId }),
      ),
    });

    const deletionError = new Error('Deletion failed');

    associationTable.repository.delete
      .mockImplementationOnce(associationTable.deleteRecords)
      .mockRejectedValueOnce(deletionError);

    await fetchCalendarEvents();

    expect(associationTable.getRecords()).toHaveLength(
      cancelledEventExternalIds.length - RECORD_DELETE_BATCH_SIZE,
    );
    expect(deleteOrphanedCalendarEvents).toHaveBeenCalledTimes(1);
    expect(handleDriverException).toHaveBeenCalledWith(
      deletionError,
      CalendarEventImportSyncStep.CALENDAR_EVENT_LIST_FETCH,
      CALENDAR_CHANNEL,
      WORKSPACE_ID,
    );
    expect(updateCalendarChannel).not.toHaveBeenCalled();
  });
});
