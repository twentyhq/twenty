import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import {
  CalendarEventImportErrorHandlerService,
  CalendarEventImportSyncStep,
} from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { CalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import {
  CalendarChannelSyncStage,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalendarFetchEventsService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly getCalendarEventsService: CalendarGetCalendarEventsService,
    private readonly calendarEventImportErrorHandlerService: CalendarEventImportErrorHandlerService,
    private readonly calendarEventsImportService: CalendarEventsImportService,
  ) {}

  public async fetchCalendarEvents(
    calendarChannel: CalendarChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const syncStep =
      calendarChannel.syncStage ===
      CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING
        ? CalendarEventImportSyncStep.FULL_CALENDAR_EVENT_LIST_FETCH
        : CalendarEventImportSyncStep.PARTIAL_CALENDAR_EVENT_LIST_FETCH;

    await this.calendarChannelSyncStatusService.markAsCalendarEventListFetchOngoing(
      [calendarChannel.id],
    );

    try {
      const getCalendarEventsResponse =
        await this.getCalendarEventsService.getCalendarEvents(
          connectedAccount,
          calendarChannel.syncCursor,
        );

      const hasFullEvents = getCalendarEventsResponse.fullEvents;

      const calendarEvents = hasFullEvents
        ? getCalendarEventsResponse.calendarEvents
        : null;
      const calendarEventIds = getCalendarEventsResponse.calendarEventIds;
      const nextSyncCursor = getCalendarEventsResponse.nextSyncCursor;

      const calendarChannelRepository =
        await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
          'calendarChannel',
        );

      if (!calendarEvents || calendarEvents?.length === 0) {
        await calendarChannelRepository.update(
          {
            id: calendarChannel.id,
          },
          {
            syncCursor: nextSyncCursor,
          },
        );

        await this.calendarChannelSyncStatusService.schedulePartialCalendarEventListFetch(
          [calendarChannel.id],
        );
      }

      await calendarChannelRepository.update(
        {
          id: calendarChannel.id,
        },
        {
          syncCursor: nextSyncCursor,
        },
      );

      if (hasFullEvents && calendarEvents) {
        // Event Import already done
        await this.calendarEventsImportService.processCalendarEventsImport(
          calendarChannel,
          connectedAccount,
          workspaceId,
          calendarEvents,
        );
      } else if (!hasFullEvents && calendarEventIds) {
        // Event Import still needed

        await this.cacheStorage.setAdd(
          `calendar-events-to-import:${workspaceId}:${calendarChannel.id}`,
          calendarEventIds,
        );

        await this.calendarChannelSyncStatusService.scheduleCalendarEventsImport(
          [calendarChannel.id],
        );
      } else {
        throw new CalendarEventImportDriverException(
          "Expected 'calendarEvents' or 'calendarEventIds' to be present",
          CalendarEventImportDriverExceptionCode.UNKNOWN,
        );
      }
    } catch (error) {
      await this.calendarEventImportErrorHandlerService.handleDriverException(
        error,
        syncStep,
        calendarChannel,
        workspaceId,
      );
    }
  }
}
