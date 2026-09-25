import { Injectable, Logger } from '@nestjs/common';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import { CALENDAR_EVENT_WEBHOOK_SYNC_INLINE_IMPORT_MAX_EVENTS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-inline-import-max-events.constant';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class CalendarEventWebhookSyncService {
  private readonly logger = new Logger(CalendarEventWebhookSyncService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
    @InjectWorkspaceScopedRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: WorkspaceScopedRepository<CalendarChannelEntity>,
    private readonly calendarFetchEventsService: CalendarFetchEventsService,
    private readonly calendarEventsImportService: CalendarEventsImportService,
  ) {}

  async processCalendarEventWebhookSync({
    calendarChannelId,
    workspaceId,
  }: {
    calendarChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    const isCalendarChannelScheduled =
      await this.markCalendarChannelAsListFetchScheduledIfPending({
        calendarChannelId,
        workspaceId,
      });

    if (!isCalendarChannelScheduled) {
      this.logger.log(
        `Skipping webhook sync for calendar channel ${calendarChannelId}, a sync is already in progress`,
      );

      return;
    }

    const calendarChannel = await this.findSyncEnabledCalendarChannel({
      calendarChannelId,
      workspaceId,
    });

    if (!isDefined(calendarChannel)) {
      return;
    }

    await this.calendarFetchEventsService.fetchCalendarEvents(
      calendarChannel,
      calendarChannel.connectedAccount,
      workspaceId,
    );

    await this.importFetchedCalendarEvents({ calendarChannelId, workspaceId });
  }

  private async markCalendarChannelAsListFetchScheduledIfPending({
    calendarChannelId,
    workspaceId,
  }: {
    calendarChannelId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const scheduledCalendarChannels =
      await this.calendarChannelRepository.updateAndReturn(
        workspaceId,
        {
          id: calendarChannelId,
          isSyncEnabled: true,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        },
        {
          syncStage:
            CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
          syncStageStartedAt: new Date(),
        },
        ['id'],
      );

    return scheduledCalendarChannels.length > 0;
  }

  private async findSyncEnabledCalendarChannel({
    calendarChannelId,
    workspaceId,
  }: {
    calendarChannelId: string;
    workspaceId: string;
  }): Promise<CalendarChannelEntity | null> {
    return this.calendarChannelRepository.findOne(workspaceId, {
      where: { id: calendarChannelId, isSyncEnabled: true },
      relations: ['connectedAccount'],
    });
  }

  private async importFetchedCalendarEvents({
    calendarChannelId,
    workspaceId,
  }: {
    calendarChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    const calendarEventsToImportCount = await this.cacheStorage.getSetLength(
      `calendar-events-to-import:${workspaceId}:${calendarChannelId}`,
    );

    if (calendarEventsToImportCount === 0) {
      return;
    }

    if (this.shouldDeferImportToCron(calendarEventsToImportCount)) {
      this.logger.log(
        `Deferring ${calendarEventsToImportCount} calendar events to the import cron for calendar channel ${calendarChannelId}`,
      );

      return;
    }

    const calendarChannel = await this.findSyncEnabledCalendarChannel({
      calendarChannelId,
      workspaceId,
    });

    if (!isDefined(calendarChannel)) {
      return;
    }

    await this.calendarEventsImportService.processCalendarEventsImport(
      calendarChannel,
      calendarChannel.connectedAccount,
      workspaceId,
    );
  }

  private shouldDeferImportToCron(
    calendarEventsToImportCount: number,
  ): boolean {
    return (
      calendarEventsToImportCount >
      CALENDAR_EVENT_WEBHOOK_SYNC_INLINE_IMPORT_MAX_EVENTS
    );
  }
}
