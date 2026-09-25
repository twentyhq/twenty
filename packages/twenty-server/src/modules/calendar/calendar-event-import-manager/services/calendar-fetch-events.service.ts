import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { Any, Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { RECORD_DELETE_BATCH_SIZE } from 'src/engine/twenty-orm/constants/record-delete-batch-size.constant';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
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
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly getCalendarEventsService: CalendarGetCalendarEventsService,
    private readonly calendarEventImportErrorHandlerService: CalendarEventImportErrorHandlerService,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
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

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        try {
          const { calendarEventIds, calendarEventIdsToDelete, nextSyncCursor } =
            await this.getCalendarEventsService.getCalendarEvents(
              connectedAccount,
              calendarChannel.syncCursor || undefined,
            );

          if (calendarEventIdsToDelete.length > 0) {
            await this.deleteCancelledEventAssociations({
              calendarChannelId: calendarChannel.id,
              cancelledEventExternalIds: calendarEventIdsToDelete,
              workspaceId,
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
            await this.calendarChannelSyncStatusService.markAsCalendarEventSyncCompleted(
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

  private async deleteCancelledEventAssociations({
    calendarChannelId,
    cancelledEventExternalIds,
    workspaceId,
  }: {
    calendarChannelId: string;
    cancelledEventExternalIds: string[];
    workspaceId: string;
  }): Promise<void> {
    for (const cancelledEventExternalIdsChunk of chunk(
      cancelledEventExternalIds,
      RECORD_DELETE_BATCH_SIZE,
    )) {
      for (;;) {
        const associationsToDelete =
          await this.workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const calendarChannelEventAssociationRepository =
                transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                  'calendarChannelEventAssociation',
                  { shouldBypassPermissionChecks: true },
                );

              const associations =
                await calendarChannelEventAssociationRepository.find({
                  where: {
                    eventExternalId: Any(cancelledEventExternalIdsChunk),
                    calendarChannelId,
                  },
                  select: { id: true, calendarEventId: true, deletedAt: true },
                  take: RECORD_DELETE_BATCH_SIZE,
                  // Soft-deleted associations of cancelled events are deleted too
                  withDeleted: true,
                });

              if (associations.length > 0) {
                await calendarChannelEventAssociationRepository.delete(
                  associations.map(({ id }) => id),
                );
              }

              return associations;
            },
          );

        if (associationsToDelete.length === 0) {
          break;
        }

        // The cleaner runs its own transaction, so it only sees this batch
        // once it is committed
        await this.calendarEventCleanerService.deleteOrphanedCalendarEvents({
          // Only deleting a live association can orphan its event
          calendarEventIds: associationsToDelete
            .filter(({ deletedAt }) => !isDefined(deletedAt))
            .map(({ calendarEventId }) => calendarEventId),
          workspaceId,
        });

        if (associationsToDelete.length < RECORD_DELETE_BATCH_SIZE) {
          break;
        }
      }
    }
  }
}
