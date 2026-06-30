import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Any, Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
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
import {
  CalendarEventImportErrorHandlerService,
  CalendarEventImportSyncStep,
} from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarImportEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-import-events.service';
import { CalendarSaveEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-save-events.service';
import { filterEventsAndReturnCancelledEvents } from 'src/modules/calendar/calendar-event-import-manager/utils/filter-events.util';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { EmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/services/email-alias-manager.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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
    private readonly calendarImportEventsService: CalendarImportEventsService,
    private readonly emailAliasManagerService: EmailAliasManagerService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  public async processCalendarEventsImport(
    calendarChannel: CalendarChannelEntity,
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsCalendarEventsImportOngoing(
      [calendarChannel.id],
      workspaceId,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        try {
          const eventIdsToFetch: string[] = await this.cacheStorage.setPop(
            `calendar-events-to-import:${workspaceId}:${calendarChannel.id}`,
            CALENDAR_EVENT_IMPORT_BATCH_SIZE,
          );

          if (!eventIdsToFetch || eventIdsToFetch.length === 0) {
            await this.calendarChannelSyncStatusService.markAsCalendarEventSyncCompleted(
              [calendarChannel.id],
              workspaceId,
            );

            return;
          }

          const calendarEvents =
            await this.calendarImportEventsService.getCalendarEvents(
              connectedAccount,
              eventIdsToFetch,
            );

          const userWorkspace = await this.userWorkspaceRepository.findOne({
            where: {
              id: (connectedAccount as unknown as { userWorkspaceId: string })
                .userWorkspaceId,
            },
          });

          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspaceId,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          const workspaceMember = userWorkspace
            ? await workspaceMemberRepository.findOne({
                where: { userId: userWorkspace.userId },
              })
            : null;

          const blocklist = workspaceMember
            ? await this.blocklistRepository.getByWorkspaceMemberId(
                workspaceMember.id,
                workspaceId,
              )
            : [];

          if (!isDefined(connectedAccount.handleAliases)) {
            connectedAccount.handleAliases =
              await this.emailAliasManagerService.refreshHandleAliases(
                connectedAccount,
                workspaceId,
              );
          }

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
              [calendarChannel.handle, ...connectedAccount.handleAliases],
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
            calendarChannelId: calendarChannel.id,
          });

          await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
            workspaceId,
          );

          if (eventIdsToFetch.length < CALENDAR_EVENT_IMPORT_BATCH_SIZE) {
            await this.calendarChannelSyncStatusService.markAsCalendarEventSyncCompleted(
              [calendarChannel.id],
              workspaceId,
            );
          } else {
            await this.calendarChannelSyncStatusService.markAsCalendarEventsImportPending(
              [calendarChannel.id],
              workspaceId,
            );
          }
        } catch (error) {
          await this.calendarEventImportErrorHandlerService.handleDriverException(
            error,
            CalendarEventImportSyncStep.CALENDAR_EVENTS_IMPORT,
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
