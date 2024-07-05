import { Injectable } from '@nestjs/common';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  CalendarChannelWorkspaceEntity,
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

@Injectable()
export class CalendarChannelSyncStatusService {
  constructor(
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
    @InjectCacheStorage(CacheStorageNamespace.Calendar)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  public async scheduleFullCalendarEventListFetch(calendarChannelId: string) {
    await this.calendarChannelRepository.update(calendarChannelId, {
      syncStage:
        CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
    });
  }

  public async schedulePartialCalendarEventListFetch(
    calendarChannelId: string,
  ) {
    await this.calendarChannelRepository.update(calendarChannelId, {
      syncStage:
        CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING,
    });
  }

  public async markAsCalendarEventListFetchOngoing(calendarChannelId: string) {
    await this.calendarChannelRepository.update(calendarChannelId, {
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
      syncStatus: CalendarChannelSyncStatus.ONGOING,
      syncStageStartedAt: new Date().toISOString(),
    });
  }

  public async resetAndScheduleFullCalendarEventListFetch(
    calendarChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `calendar-events-to-import:${workspaceId}:google-calendar:${calendarChannelId}`,
    );

    await this.calendarChannelRepository.update(calendarChannelId, {
      syncCursor: '',
      syncStageStartedAt: null,
      throttleFailureCount: 0,
    });

    await this.scheduleFullCalendarEventListFetch(calendarChannelId);
  }

  public async scheduleCalendarEventsImport(calendarChannelId: string) {
    await this.calendarChannelRepository.update(calendarChannelId, {
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    });
  }

  public async markAsCalendarEventsImportOngoing(calendarChannelId: string) {
    await this.calendarChannelRepository.update(calendarChannelId, {
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
      syncStatus: CalendarChannelSyncStatus.ONGOING,
    });
  }

  public async markAsCalendarEventsImportCompleted(calendarChannelId: string) {
    await this.calendarChannelRepository.update(calendarChannelId, {
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
      syncStatus: CalendarChannelSyncStatus.ACTIVE,
    });
  }

  public async markAsFailedUnknownAndFlushCalendarEventsToImport(
    calendarChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `calendar-events-to-import:${workspaceId}:google-calendar:${calendarChannelId}`,
    );

    await this.calendarChannelRepository.update(calendarChannelId, {
      syncStatus: CalendarChannelSyncStatus.FAILED_UNKNOWN,
      syncStage: CalendarChannelSyncStage.FAILED,
    });
  }

  public async markAsFailedInsufficientPermissionsAndFlushCalendarEventsToImport(
    calendarChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `calendar-events-to-import:${workspaceId}:google-calendar:${calendarChannelId}`,
    );

    await this.calendarChannelRepository.update(calendarChannelId, {
      syncStatus: CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      syncStage: CalendarChannelSyncStage.FAILED,
    });
  }
}
