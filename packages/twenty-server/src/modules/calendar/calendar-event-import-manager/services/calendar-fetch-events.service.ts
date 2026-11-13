import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { Any, Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { CALENDAR_RECURRING_EVENT_HORIZON_MS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-recurring-event-horizon-ms.constant';
import {
  CalendarEventImportErrorHandlerService,
  CalendarEventImportSyncStep,
} from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarRecurringEventWakeUpService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-recurring-event-wake-up.service';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { getCalendarEventsToImportCacheKey } from 'src/modules/calendar/common/utils/get-calendar-events-to-import-cache-key.util';

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
    private readonly featureFlagService: FeatureFlagService,
    private readonly calendarRecurringEventWakeUpService: CalendarRecurringEventWakeUpService,
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
          const isRecurringEventHorizonEnabled =
            await this.featureFlagService.isFeatureEnabled(
              FeatureFlagKey.IS_CALENDAR_RECURRING_EVENT_HORIZON_ENABLED,
              workspaceId,
            );

          const recurringEventHorizon = isRecurringEventHorizonEnabled
            ? new Date(Date.now() + CALENDAR_RECURRING_EVENT_HORIZON_MS)
            : undefined;

          const {
            calendarEventIds,
            calendarEventIdsToDelete,
            recurringEventExternalIdsBeyondHorizon,
            nextSyncCursor,
          } = await this.getCalendarEventsService.getCalendarEvents({
            connectedAccount,
            syncCursor: calendarChannel.syncCursor || undefined,
            recurringEventHorizon,
          });

          if (calendarEventIdsToDelete.length > 0) {
            const calendarChannelEventAssociationRepository =
              this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<CalendarChannelEventAssociationWorkspaceEntity>(
                'calendarChannelEventAssociation',
              );

            const associationsToDelete =
              await calendarChannelEventAssociationRepository.find({
                where: {
                  eventExternalId: Any(calendarEventIdsToDelete),
                  calendarChannelId: calendarChannel.id,
                },
                select: { calendarEventId: true },
              });

            await calendarChannelEventAssociationRepository.delete({
              eventExternalId: Any(calendarEventIdsToDelete),
              calendarChannelId: calendarChannel.id,
            });

            await this.calendarEventCleanerService.deleteOrphanedCalendarEvents(
              {
                calendarEventIds: associationsToDelete.map(
                  ({ calendarEventId }) => calendarEventId,
                ),
                workspaceId,
              },
            );
          }

          await this.calendarRecurringEventWakeUpService.scheduleImmediateWakeUpForRecurringEvents(
            {
              workspaceId,
              calendarChannelId: calendarChannel.id,
              recurringEventExternalIds: recurringEventExternalIdsBeyondHorizon,
            },
          );

          const calendarEventIdsToImportCacheKey =
            getCalendarEventsToImportCacheKey({
              workspaceId,
              calendarChannelId: calendarChannel.id,
            });

          if (calendarEventIds.length > 0) {
            await this.cacheStorage.setAdd(
              calendarEventIdsToImportCacheKey,
              calendarEventIds,
            );
          }

          const hasCalendarEventsToImport =
            (await this.cacheStorage.getSetLength(
              calendarEventIdsToImportCacheKey,
            )) > 0;

          if (hasCalendarEventsToImport) {
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
}
