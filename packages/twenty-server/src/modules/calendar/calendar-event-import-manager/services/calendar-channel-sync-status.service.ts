import { Injectable } from '@nestjs/common';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';

@Injectable()
export class CalendarChannelSyncStatusService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    @InjectCacheStorage(CacheStorageNamespace.Calendar)
    private readonly cacheStorage: CacheStorageService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  public async scheduleFullCalendarEventListFetch(calendarChannelId: string) {
    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelId, {
      syncStage:
        CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
    });
  }

  public async schedulePartialCalendarEventListFetch(
    calendarChannelId: string,
  ) {
    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelId, {
      syncStage:
        CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING,
    });
  }

  public async markAsCalendarEventListFetchOngoing(calendarChannelId: string) {
    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelId, {
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

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelId, {
      syncCursor: '',
      syncStageStartedAt: null,
      throttleFailureCount: 0,
    });

    await this.scheduleFullCalendarEventListFetch(calendarChannelId);
  }

  public async scheduleCalendarEventsImport(calendarChannelId: string) {
    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelId, {
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    });
  }

  public async markAsCalendarEventsImportOngoing(calendarChannelId: string) {
    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelId, {
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
      syncStatus: CalendarChannelSyncStatus.ONGOING,
    });
  }

  public async markAsCompletedAndSchedulePartialMessageListFetch(
    calendarChannelId: string,
  ) {
    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelId, {
      syncStage:
        CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING,
      syncStatus: CalendarChannelSyncStatus.ACTIVE,
      throttleFailureCount: 0,
      syncStageStartedAt: null,
    });

    await this.schedulePartialCalendarEventListFetch(calendarChannelId);
  }

  public async markAsFailedUnknownAndFlushCalendarEventsToImport(
    calendarChannelId: string,
    workspaceId: string,
  ) {
    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await this.cacheStorage.del(
      `calendar-events-to-import:${workspaceId}:google-calendar:${calendarChannelId}`,
    );

    await calendarChannelRepository.update(calendarChannelId, {
      syncStatus: CalendarChannelSyncStatus.FAILED_UNKNOWN,
      syncStage: CalendarChannelSyncStage.FAILED,
    });
  }

  public async markAsFailedInsufficientPermissionsAndFlushCalendarEventsToImport(
    calendarChannelId: string,
    workspaceId: string,
  ) {
    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await this.cacheStorage.del(
      `calendar-events-to-import:${workspaceId}:google-calendar:${calendarChannelId}`,
    );

    await calendarChannelRepository.update(calendarChannelId, {
      syncStatus: CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      syncStage: CalendarChannelSyncStage.FAILED,
    });

    await this.addToAccountsToReconnect(calendarChannelId, workspaceId);
  }

  private async addToAccountsToReconnect(
    calendarChannelId: string,
    workspaceId: string,
  ) {
    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    const calendarChannel = await calendarChannelRepository.findOne({
      where: {
        id: calendarChannelId,
      },
      relations: {
        connectedAccount: {
          accountOwner: true,
        },
      },
    });

    if (!calendarChannel) {
      return;
    }

    const userId = calendarChannel.connectedAccount.accountOwner.userId;
    const connectedAccountId = calendarChannel.connectedAccount.id;

    await this.accountsToReconnectService.addAccountToReconnectByKey(
      AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
      userId,
      workspaceId,
      connectedAccountId,
    );
  }
}
