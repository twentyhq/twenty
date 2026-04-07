import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { CalendarAccountAuthenticationService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-account-authentication.service';
import {
  CalendarEventImportErrorHandlerService,
  CalendarEventImportSyncStep,
} from 'src/modules/calendar/calendar-event-import-manager/services/calendar-event-import-exception-handler.service';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { CalendarGetCalendarEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
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
    private readonly calendarEventsImportService: CalendarEventsImportService,
    private readonly calendarAccountAuthenticationService: CalendarAccountAuthenticationService,
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      try {
        const { accessToken, refreshToken } =
          await this.calendarAccountAuthenticationService.validateAndRefreshConnectedAccountAuthentication(
            {
              connectedAccount,
              workspaceId,
              calendarChannelId: calendarChannel.id,
            },
          );

        const connectedAccountWithFreshTokens = {
          ...connectedAccount,
          accessToken,
          refreshToken,
        };

        const getCalendarEventsResponse =
          await this.getCalendarEventsService.getCalendarEvents(
            connectedAccountWithFreshTokens,
            calendarChannel.syncCursor || undefined,
          );

        const hasFullEvents = getCalendarEventsResponse.fullEvents;

        const calendarEvents = hasFullEvents
          ? getCalendarEventsResponse.calendarEvents
          : null;
        const calendarEventIds = getCalendarEventsResponse.calendarEventIds;
        const nextSyncCursor = getCalendarEventsResponse.nextSyncCursor;

        if (!calendarEvents || calendarEvents?.length === 0) {
          await this.calendarChannelRepository.update(
            { id: calendarChannel.id, workspaceId },
            {
              syncCursor: nextSyncCursor,
            },
          );

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

        if (hasFullEvents && calendarEvents) {
          await this.calendarEventsImportService.processCalendarEventsImport(
            calendarChannel,
            connectedAccount,
            workspaceId,
            calendarEvents,
          );
        } else if (!hasFullEvents && calendarEventIds) {
          await this.cacheStorage.setAdd(
            `calendar-events-to-import:${workspaceId}:${calendarChannel.id}`,
            calendarEventIds,
          );

          await this.calendarChannelSyncStatusService.markAsCalendarEventsImportPending(
            [calendarChannel.id],
            workspaceId,
          );
        } else {
          throw new CalendarEventImportDriverException(
            "Expected 'calendarEvents' or 'calendarEventIds' to be present",
            CalendarEventImportDriverExceptionCode.UNKNOWN,
          );
        }
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
    }, authContext);
  }
}
