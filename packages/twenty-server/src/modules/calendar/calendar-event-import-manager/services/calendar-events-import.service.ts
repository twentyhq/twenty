import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import {
  CalendarEventImportErrorHandlerService,
  CalendarEventImportSyncStep,
} from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import {
  CalendarGetCalendarEventsService,
  GetCalendarEventsResponse,
} from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarSaveEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-save-events.service';
import { filterEventsAndReturnCancelledEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events.util';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import {
  CalendarChannelSyncStage,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalendarEventsImportService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly getCalendarEventsService: CalendarGetCalendarEventsService,
    private readonly calendarSaveEventsService: CalendarSaveEventsService,
    private readonly calendarEventImportErrorHandlerService: CalendarEventImportErrorHandlerService,
  ) {}

  public async processCalendarEventsImport(
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
    let calendarEvents: GetCalendarEventsResponse['calendarEvents'] = [];
    let nextSyncCursor: GetCalendarEventsResponse['nextSyncCursor'] = '';

    try {
      const getCalendarEventsResponse =
        await this.getCalendarEventsService.getCalendarEvents(
          connectedAccount,
          calendarChannel.syncCursor,
        );

      calendarEvents = getCalendarEventsResponse.calendarEvents;
      nextSyncCursor = getCalendarEventsResponse.nextSyncCursor;

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

      const blocklist = await this.blocklistRepository.getByWorkspaceMemberId(
        connectedAccount.accountOwnerId,
        workspaceId,
      );

      const { filteredEvents, cancelledEvents } =
        filterEventsAndReturnCancelledEvents(
          [
            calendarChannel.handle,
            ...connectedAccount.handleAliases.split(','),
          ],
          calendarEvents,
          blocklist.map((blocklist) => blocklist.handle),
        );

      const cancelledEventExternalIds = cancelledEvents.map(
        (event) => event.externalId,
      );

      await this.calendarSaveEventsService.saveCalendarEventsAndEnqueueContactCreationJob(
        filteredEvents,
        calendarChannel,
        connectedAccount,
        workspaceId,
      );

      const calendarChannelEventAssociationRepository =
        await this.twentyORMManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
          'calendarChannelEventAssociation',
        );

      await calendarChannelEventAssociationRepository.delete({
        eventExternalId: Any(cancelledEventExternalIds),
        calendarChannel: {
          id: calendarChannel.id,
        },
      });

      await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
        workspaceId,
      );

      await calendarChannelRepository.update(
        {
          id: calendarChannel.id,
        },
        {
          syncCursor: nextSyncCursor,
        },
      );

      await this.calendarChannelSyncStatusService.markAsCompletedAndSchedulePartialCalendarEventListFetch(
        [calendarChannel.id],
      );
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
