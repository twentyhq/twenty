import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-channel-sync-status.service';
import { CalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarSaveEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-save-events.service';
import { filterEventsAndReturnCancelledEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events.util';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalendarEventsImportService {
  constructor(
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarChannelEventAssociationWorkspaceEntity)
    private readonly calendarChannelEventAssociationRepository: WorkspaceRepository<CalendarChannelEventAssociationWorkspaceEntity>,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly getCalendarEventsService: CalendarGetCalendarEventsService,
    private readonly calendarSaveEventsService: CalendarSaveEventsService,
  ) {}

  public async processCalendarEventsImport(
    calendarChannel: CalendarChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsCalendarEventListFetchOngoing(
      calendarChannel.id,
    );

    const { calendarEvents, nextSyncCursor } =
      await this.getCalendarEventsService.getCalendarEvents(
        connectedAccount,
        calendarChannel.syncCursor,
      );

    if (!calendarEvents || calendarEvents?.length === 0) {
      await this.calendarChannelRepository.update(
        {
          id: calendarChannel.id,
        },
        {
          syncCursor: nextSyncCursor,
        },
      );

      await this.calendarChannelSyncStatusService.schedulePartialCalendarEventListFetch(
        calendarChannel.id,
      );
    }

    const blocklist = await this.blocklistRepository.getByWorkspaceMemberId(
      connectedAccount.accountOwnerId,
      workspaceId,
    );

    const { filteredEvents, cancelledEvents } =
      filterEventsAndReturnCancelledEvents(
        calendarChannel,
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

    await this.calendarChannelEventAssociationRepository.delete({
      eventExternalId: Any(cancelledEventExternalIds),
      calendarChannel: {
        id: calendarChannel.id,
      },
    });

    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      workspaceId,
    );

    await this.calendarChannelRepository.update(
      {
        id: calendarChannel.id,
      },
      {
        syncCursor: nextSyncCursor,
      },
    );

    await this.calendarChannelSyncStatusService.schedulePartialCalendarEventListFetch(
      calendarChannel.id,
    );
  }
}
