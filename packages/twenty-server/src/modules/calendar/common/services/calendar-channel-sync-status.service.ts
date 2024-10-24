import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';

@Injectable()
export class CalendarChannelSyncStatusService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  public async scheduleFullCalendarEventListFetch(
    calendarChannelIds: string[],
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelIds, {
      syncStage:
        CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
    });
  }

  public async schedulePartialCalendarEventListFetch(
    calendarChannelIds: string[],
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelIds, {
      syncStage:
        CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING,
    });
  }

  public async markAsCalendarEventListFetchOngoing(
    calendarChannelIds: string[],
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelIds, {
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
      syncStatus: CalendarChannelSyncStatus.ONGOING,
      syncStageStartedAt: new Date().toISOString(),
    });
  }

  public async resetAndScheduleFullCalendarEventListFetch(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    for (const calendarChannelId of calendarChannelIds) {
      await this.cacheStorage.del(
        `calendar-events-to-import:${workspaceId}:${calendarChannelId}`,
      );
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelIds, {
      syncCursor: '',
      syncStageStartedAt: null,
      throttleFailureCount: 0,
    });

    await this.scheduleFullCalendarEventListFetch(calendarChannelIds);
  }

  public async resetSyncStageStartedAt(calendarChannelIds: string[]) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelIds, {
      syncStageStartedAt: null,
    });
  }

  public async scheduleCalendarEventsImport(calendarChannelIds: string[]) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelIds, {
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
    });
  }

  public async markAsCalendarEventsImportOngoing(calendarChannelIds: string[]) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelIds, {
      syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
      syncStatus: CalendarChannelSyncStatus.ONGOING,
    });
  }

  public async markAsCompletedAndSchedulePartialCalendarEventListFetch(
    calendarChannelIds: string[],
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.update(calendarChannelIds, {
      syncStage:
        CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING,
      syncStatus: CalendarChannelSyncStatus.ACTIVE,
      throttleFailureCount: 0,
      syncStageStartedAt: null,
      syncedAt: new Date().toISOString(),
    });

    await this.schedulePartialCalendarEventListFetch(calendarChannelIds);
  }

  public async markAsFailedUnknownAndFlushCalendarEventsToImport(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    for (const calendarChannelId of calendarChannelIds) {
      await this.cacheStorage.del(
        `calendar-events-to-import:${workspaceId}:${calendarChannelId}`,
      );
    }

    await calendarChannelRepository.update(calendarChannelIds, {
      syncStatus: CalendarChannelSyncStatus.FAILED_UNKNOWN,
      syncStage: CalendarChannelSyncStage.FAILED,
    });
  }

  public async markAsFailedInsufficientPermissionsAndFlushCalendarEventsToImport(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    for (const calendarChannelId of calendarChannelIds) {
      await this.cacheStorage.del(
        `calendar-events-to-import:${workspaceId}:${calendarChannelId}`,
      );
    }
    await calendarChannelRepository.update(calendarChannelIds, {
      syncStatus: CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      syncStage: CalendarChannelSyncStage.FAILED,
    });

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    const calendarChannels = await calendarChannelRepository.find({
      select: ['id', 'connectedAccountId'],
      where: { id: Any(calendarChannelIds) },
    });

    const connectedAccountIds = calendarChannels.map(
      (calendarChannel) => calendarChannel.connectedAccountId,
    );

    await connectedAccountRepository.update(
      { id: Any(connectedAccountIds) },
      {
        authFailedAt: new Date(),
      },
    );

    await this.addToAccountsToReconnect(
      calendarChannels.map((calendarChannel) => calendarChannel.id),
      workspaceId,
    );
  }

  private async addToAccountsToReconnect(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    const calendarChannels = await calendarChannelRepository.find({
      where: {
        id: Any(calendarChannelIds),
      },
      relations: {
        connectedAccount: {
          accountOwner: true,
        },
      },
    });

    for (const calendarChannel of calendarChannels) {
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
}
