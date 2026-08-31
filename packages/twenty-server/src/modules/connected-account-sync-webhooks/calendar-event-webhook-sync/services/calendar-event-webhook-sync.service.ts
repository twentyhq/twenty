import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import {
  CalendarEventWebhookSyncException,
  CalendarEventWebhookSyncExceptionCode,
} from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/calendar-event-webhook-sync.exception';
import { CALENDAR_EVENT_WEBHOOK_SYNC_INLINE_IMPORT_MAX_EVENTS } from 'src/modules/connected-account-sync-webhooks/calendar-event-webhook-sync/constants/calendar-event-webhook-sync-inline-import-max-events.constant';

@Injectable()
export class CalendarEventWebhookSyncService {
  private readonly logger = new Logger(CalendarEventWebhookSyncService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
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
      throw new CalendarEventWebhookSyncException(
        `Calendar channel ${calendarChannelId} is not available for a webhook sync`,
        CalendarEventWebhookSyncExceptionCode.CALENDAR_CHANNEL_SYNC_ALREADY_IN_PROGRESS,
      );
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
    const updateResult = await this.calendarChannelRepository
      .createQueryBuilder()
      .update()
      .set({
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
        syncStageStartedAt: new Date(),
      })
      .where({
        id: calendarChannelId,
        workspaceId,
        isSyncEnabled: true,
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
      })
      .returning('id')
      .execute();

    return updateResult.raw.length > 0;
  }

  private async findSyncEnabledCalendarChannel({
    calendarChannelId,
    workspaceId,
  }: {
    calendarChannelId: string;
    workspaceId: string;
  }): Promise<CalendarChannelEntity | null> {
    return this.calendarChannelRepository.findOne({
      where: { id: calendarChannelId, workspaceId, isSyncEnabled: true },
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
