import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  type CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';

@Injectable()
export class CalendarChannelSyncStatusService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    private readonly metricsService: MetricsService,
  ) {}

  public async markAsCalendarEventListFetchPending(
    calendarChannelIds: string[],
    workspaceId: string,
    preserveSyncStageStartedAt: boolean = false,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.update(calendarChannelIds, {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
          ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
        });
      },
    );
  }

  public async markAsCalendarEventListFetchOngoing(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.update(calendarChannelIds, {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
          syncStatus: CalendarChannelSyncStatus.ONGOING,
          syncStageStartedAt: new Date().toISOString(),
        });
      },
    );
  }

  public async resetAndMarkAsCalendarEventListFetchPending(
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

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.update(calendarChannelIds, {
          syncCursor: '',
          syncStageStartedAt: null,
          throttleFailureCount: 0,
        });
      },
    );

    await this.markAsCalendarEventListFetchPending(
      calendarChannelIds,
      workspaceId,
    );
  }

  public async resetSyncStageStartedAt(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.update(calendarChannelIds, {
          syncStageStartedAt: null,
        });
      },
    );
  }

  public async markAsCalendarEventsImportPending(
    calendarChannelIds: string[],
    workspaceId: string,
    preserveSyncStageStartedAt: boolean = false,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.update(calendarChannelIds, {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
          ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
        });
      },
    );
  }

  public async markAsCalendarEventsImportOngoing(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.update(calendarChannelIds, {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
          syncStatus: CalendarChannelSyncStatus.ONGOING,
        });
      },
    );
  }

  public async markAsCompletedAndMarkAsCalendarEventListFetchPending(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.update(calendarChannelIds, {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
          syncStatus: CalendarChannelSyncStatus.ACTIVE,
          throttleFailureCount: 0,
          syncStageStartedAt: null,
          syncedAt: new Date().toISOString(),
        });
      },
    );

    await this.markAsCalendarEventListFetchPending(
      calendarChannelIds,
      workspaceId,
    );

    await this.metricsService.batchIncrementCounter({
      key: MetricsKeys.CalendarEventSyncJobActive,
      eventIds: calendarChannelIds,
    });
  }

  public async markAsFailedUnknownAndFlushCalendarEventsToImport(
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

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.update(calendarChannelIds, {
          syncStatus: CalendarChannelSyncStatus.FAILED_UNKNOWN,
          syncStage: CalendarChannelSyncStage.FAILED,
        });
      },
    );

    await this.metricsService.batchIncrementCounter({
      key: MetricsKeys.CalendarEventSyncJobFailedUnknown,
      eventIds: calendarChannelIds,
    });
  }

  public async markAsFailedInsufficientPermissionsAndFlushCalendarEventsToImport(
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

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.update(calendarChannelIds, {
          syncStatus: CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
          syncStage: CalendarChannelSyncStage.FAILED,
        });

        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
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
      },
    );

    await this.metricsService.batchIncrementCounter({
      key: MetricsKeys.CalendarEventSyncJobFailedInsufficientPermissions,
      eventIds: calendarChannelIds,
    });
  }

  private async addToAccountsToReconnect(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const calendarChannelRepository =
      await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
        workspaceId,
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
