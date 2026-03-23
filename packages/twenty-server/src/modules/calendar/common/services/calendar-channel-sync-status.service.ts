import { Injectable } from '@nestjs/common';

import { Any, In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { CalendarChannelDataAccessService } from 'src/engine/metadata-modules/calendar-channel/data-access/services/calendar-channel-data-access.service';
import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CalendarChannelSyncStatusService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectCacheStorage(CacheStorageNamespace.ModuleCalendar)
    private readonly cacheStorage: CacheStorageService,
    private readonly calendarChannelDataAccessService: CalendarChannelDataAccessService,
    private readonly connectedAccountDataAccessService: ConnectedAccountDataAccessService,
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: In(calendarChannelIds) },
        {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
          ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
        },
      );
    }, authContext);
  }

  public async markAsCalendarEventListFetchOngoing(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: In(calendarChannelIds) },
        {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
          syncStatus: CalendarChannelSyncStatus.ONGOING,
          syncStageStartedAt: new Date().toISOString(),
        },
      );
    }, authContext);
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: In(calendarChannelIds) },
        {
          syncCursor: '',
          syncStageStartedAt: null,
          throttleFailureCount: 0,
        },
      );
    }, authContext);

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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: In(calendarChannelIds) },
        {
          syncStageStartedAt: null,
        },
      );
    }, authContext);
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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: In(calendarChannelIds) },
        {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
          ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
        },
      );
    }, authContext);
  }

  public async markAsCalendarEventsImportOngoing(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: In(calendarChannelIds) },
        {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
          syncStatus: CalendarChannelSyncStatus.ONGOING,
          syncStageStartedAt: new Date().toISOString(),
        },
      );
    }, authContext);
  }

  public async markAsCompletedAndMarkAsCalendarEventListFetchPending(
    calendarChannelIds: string[],
    workspaceId: string,
  ) {
    if (!calendarChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: In(calendarChannelIds) },
        {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
          syncStatus: CalendarChannelSyncStatus.ACTIVE,
          throttleFailureCount: 0,
          syncStageStartedAt: null,
          syncedAt: new Date().toISOString(),
        },
      );
    }, authContext);

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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: In(calendarChannelIds) },
        {
          syncStatus: CalendarChannelSyncStatus.FAILED_UNKNOWN,
          syncStage: CalendarChannelSyncStage.FAILED,
        },
      );
    }, authContext);

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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: In(calendarChannelIds) },
        {
          syncStatus: CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
          syncStage: CalendarChannelSyncStage.FAILED,
        },
      );

      const calendarChannels = await this.calendarChannelDataAccessService.find(
        workspaceId,
        {
          select: ['id', 'connectedAccountId'],
          where: { id: Any(calendarChannelIds) },
        },
      );

      const connectedAccountIds = calendarChannels.map(
        (calendarChannel) => calendarChannel.connectedAccountId,
      );

      await this.connectedAccountDataAccessService.update(
        workspaceId,
        { id: Any(connectedAccountIds) },
        {
          authFailedAt: new Date(),
        },
      );

      await this.addToAccountsToReconnect(
        calendarChannels.map((calendarChannel) => calendarChannel.id),
        workspaceId,
      );
    }, authContext);

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

    const calendarChannels = await this.calendarChannelDataAccessService.find(
      workspaceId,
      {
        select: ['id', 'connectedAccountId'],
        where: {
          id: Any(calendarChannelIds),
        },
      },
    );

    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    for (const calendarChannel of calendarChannels) {
      const connectedAccount =
        await this.connectedAccountDataAccessService.findOne(workspaceId, {
          where: { id: calendarChannel.connectedAccountId },
        });

      if (!connectedAccount) {
        continue;
      }

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: { id: connectedAccount.accountOwnerId },
      });

      if (!workspaceMember) {
        continue;
      }

      const userId = workspaceMember.userId;
      const connectedAccountId = connectedAccount.id;

      await this.accountsToReconnectService.addAccountToReconnectByKey(
        AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
        userId,
        workspaceId,
        connectedAccountId,
      );
    }
  }
}
