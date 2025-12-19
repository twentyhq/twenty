import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { Any } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { CALENDAR_EVENT_IMPORT_BATCH_SIZE } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-event-import-batch-size';
import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { MicrosoftCalendarImportEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-import-events.service';
import {
  CalendarEventImportErrorHandlerService,
  CalendarEventImportSyncStep,
} from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarSaveEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-save-events.service';
import { filterEventsAndReturnCancelledEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events.util';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalendarEventsImportService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly calendarSaveEventsService: CalendarSaveEventsService,
    private readonly calendarEventImportErrorHandlerService: CalendarEventImportErrorHandlerService,
    private readonly microsoftCalendarImportEventService: MicrosoftCalendarImportEventsService,
  ) {}

  public async processCalendarEventsImport(
    calendarChannel: CalendarChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    fetchedCalendarEvents?: FetchedCalendarEvent[],
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsCalendarEventsImportOngoing(
      [calendarChannel.id],
      workspaceId,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        let calendarEvents: FetchedCalendarEvent[] = [];

        try {
          if (fetchedCalendarEvents) {
            calendarEvents = fetchedCalendarEvents;
          } else {
            const eventIdsToFetch: string[] = await this.cacheStorage.setPop(
              `calendar-events-to-import:${workspaceId}:${calendarChannel.id}`,
              CALENDAR_EVENT_IMPORT_BATCH_SIZE,
            );

            if (!eventIdsToFetch || eventIdsToFetch.length === 0) {
              await this.calendarChannelSyncStatusService.markAsCompletedAndMarkAsCalendarEventListFetchPending(
                [calendarChannel.id],
                workspaceId,
              );

              return;
            }

            switch (connectedAccount.provider) {
              case 'microsoft':
                calendarEvents =
                  await this.microsoftCalendarImportEventService.getCalendarEvents(
                    connectedAccount,
                    eventIdsToFetch,
                  );
                break;
              default:
                break;
            }
          }

          if (!calendarEvents || calendarEvents?.length === 0) {
            await this.calendarChannelSyncStatusService.markAsCalendarEventListFetchPending(
              [calendarChannel.id],
              workspaceId,
            );
          }

          const blocklist =
            await this.blocklistRepository.getByWorkspaceMemberId(
              connectedAccount.accountOwnerId,
              workspaceId,
            );

          if (
            !isDefined(connectedAccount.handleAliases) ||
            !isDefined(calendarChannel.handle)
          ) {
            throw new CalendarEventImportDriverException(
              'Calendar channel handle or Handle aliases are required',
              CalendarEventImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
            );
          }

          const { filteredEvents, cancelledEvents } =
            filterEventsAndReturnCancelledEvents(
              [
                calendarChannel.handle,
                ...connectedAccount.handleAliases.split(','),
              ],
              calendarEvents,
              blocklist.map((blocklist) => blocklist.handle ?? ''),
            );

          const cancelledEventExternalIds = cancelledEvents.map(
            (event) => event.id,
          );

          const BATCH_SIZE = 1000;

          for (let i = 0; i < filteredEvents.length; i = i + BATCH_SIZE) {
            const eventsBatch = filteredEvents.slice(i, i + BATCH_SIZE);

            await this.calendarSaveEventsService.saveCalendarEventsAndEnqueueContactCreationJob(
              eventsBatch,
              calendarChannel,
              connectedAccount,
              workspaceId,
            );
          }
          const calendarChannelEventAssociationRepository =
            await this.globalWorkspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
              workspaceId,
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

          await this.calendarChannelSyncStatusService.markAsCompletedAndMarkAsCalendarEventListFetchPending(
            [calendarChannel.id],
            workspaceId,
          );
        } catch (error) {
          await this.calendarEventImportErrorHandlerService.handleDriverException(
            error,
            CalendarEventImportSyncStep.CALENDAR_EVENTS_IMPORT,
            calendarChannel,
            workspaceId,
          );
        }
      },
    );
  }
}
