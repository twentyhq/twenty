import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Any, Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarEventImportErrorHandlerService,
  CalendarEventImportSyncStep,
} from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

@Injectable()
export class CalendarFetchEventsService {
  private readonly logger = new Logger(CalendarFetchEventsService.name);
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly getCalendarEventsService: CalendarGetCalendarEventsService,
    private readonly calendarEventImportErrorHandlerService: CalendarEventImportErrorHandlerService,
  ) {}

  public async fetchCalendarEvents(
    calendarChannel: CalendarChannelEntity,
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `WorkspaceId: ${workspaceId}, CalendarChannelId: ${calendarChannel.id} - Fetching calendar events`,
    );

    await this.calendarChannelSyncStatusService.markAsCalendarEventListFetchOngoing(
      [calendarChannel.id],
      workspaceId,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        try {
          const { calendarEventIds, calendarEventIdsToDelete, nextSyncCursor } =
            await this.getCalendarEventsService.getCalendarEvents(
              connectedAccount,
              calendarChannel.syncCursor || undefined,
            );

          if (calendarEventIdsToDelete.length > 0) {
            const calendarChannelEventAssociationRepository =
              await this.globalWorkspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                workspaceId,
                'calendarChannelEventAssociation',
              );

            await calendarChannelEventAssociationRepository.delete({
              eventExternalId: Any(calendarEventIdsToDelete),
              calendarChannelId: calendarChannel.id,
            });
          }

          if (calendarEventIds.length > 0) {
            await this.cacheStorage.setAdd(
              `calendar-events-to-import:${workspaceId}:${calendarChannel.id}`,
              calendarEventIds,
            );

            await this.calendarChannelSyncStatusService.markAsCalendarEventsImportPending(
              [calendarChannel.id],
              workspaceId,
            );
          } else {
            await this.calendarChannelSyncStatusService.markAsCalendarEventListFetchPending(
              [calendarChannel.id],
              workspaceId,
            );
          }

          await this.calendarChannelRepository.update(
            { id: calendarChannel.id, workspaceId },
            {
              syncCursor: nextSyncCursor,
            },
          );
        } catch (error) {
          this.logger.error(
            `WorkspaceId: ${workspaceId}, CalendarChannelId: ${calendarChannel.id} - Calendar event fetch error: ${error.message}`,
          );
          await this.calendarEventImportErrorHandlerService.handleDriverException(
            error,
            CalendarEventImportSyncStep.CALENDAR_EVENT_LIST_FETCH,
            calendarChannel,
            workspaceId,
          );
        }
      },
      authContext,
      { lite: true },
    );
  }
}
