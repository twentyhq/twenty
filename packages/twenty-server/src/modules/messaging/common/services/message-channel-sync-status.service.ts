import { Injectable } from '@nestjs/common';

import { Any, In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@Injectable()
export class MessageChannelSyncStatusService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    private readonly metricsService: MetricsService,
  ) {}

  public async markAsMessagesListFetchPending(
    messageChannelIds: string[],
    workspaceId: string,
    preserveSyncStageStartedAt: boolean = false,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
        });
      },
    );
  }

  public async markAsMessagesImportPending(
    messageChannelIds: string[],
    workspaceId: string,
    preserveSyncStageStartedAt: boolean = false,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
          ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
        });
      },
    );
  }

  public async resetAndMarkAsMessagesListFetchPending(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    for (const messageChannelId of messageChannelIds) {
      await this.cacheStorage.del(
        `messages-to-import:${workspaceId}:${messageChannelId}`,
      );
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const messageFolderRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
            workspaceId,
            'messageFolder',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncCursor: '',
          syncStageStartedAt: null,
          throttleFailureCount: 0,
          pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
        });

        await messageFolderRepository.update(
          { messageChannelId: In(messageChannelIds) },
          {
            syncCursor: '',
            pendingSyncAction: MessageFolderPendingSyncAction.NONE,
          },
        );
      },
    );

    await this.markAsMessagesListFetchPending(messageChannelIds, workspaceId);
  }

  public async resetSyncStageStartedAt(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncStageStartedAt: null,
        });
      },
    );
  }

  public async markAsMessagesListFetchScheduled(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
          syncStatus: MessageChannelSyncStatus.ONGOING,
          syncStageStartedAt: new Date().toISOString(),
        });
      },
    );
  }

  public async markAsMessagesListFetchOngoing(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
          syncStatus: MessageChannelSyncStatus.ONGOING,
        });
      },
    );
  }

  public async markAsCompletedAndMarkAsMessagesListFetchPending(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncStatus: MessageChannelSyncStatus.ACTIVE,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          throttleFailureCount: 0,
          syncStageStartedAt: null,
          syncedAt: new Date().toISOString(),
        });
      },
    );

    await this.metricsService.batchIncrementCounter({
      key: MetricsKeys.MessageChannelSyncJobActive,
      eventIds: messageChannelIds,
    });
  }

  public async markAsMessagesImportScheduled(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
        });
      },
    );
  }

  public async markAsMessagesImportOngoing(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
          syncStageStartedAt: new Date().toISOString(),
        });
      },
    );
  }

  public async markAsFailed(
    messageChannelIds: string[],
    workspaceId: string,
    syncStatus:
      | MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS
      | MessageChannelSyncStatus.FAILED_UNKNOWN,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        await messageChannelRepository.update(messageChannelIds, {
          syncStage: MessageChannelSyncStage.FAILED,
          syncStatus: syncStatus,
        });

        const metricsKey =
          syncStatus ===
          MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS
            ? MetricsKeys.MessageChannelSyncJobFailedInsufficientPermissions
            : MetricsKeys.MessageChannelSyncJobFailedUnknown;

        await this.metricsService.batchIncrementCounter({
          key: metricsKey,
          eventIds: messageChannelIds,
        });

        if (
          syncStatus ===
          MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS
        ) {
          const connectedAccountRepository =
            await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
              workspaceId,
              'connectedAccount',
            );

          const messageChannels = await messageChannelRepository.find({
            select: ['id', 'connectedAccountId'],
            where: { id: Any(messageChannelIds) },
          });

          const connectedAccountIds = messageChannels.map(
            (messageChannel) => messageChannel.connectedAccountId,
          );

          await connectedAccountRepository.update(
            { id: Any(connectedAccountIds) },
            {
              authFailedAt: new Date(),
            },
          );

          await this.addToAccountsToReconnect(
            messageChannels.map((messageChannel) => messageChannel.id),
            workspaceId,
          );
        }
      },
    );
  }

  private async addToAccountsToReconnect(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannelRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannels = await messageChannelRepository.find({
      where: { id: Any(messageChannelIds) },
      relations: {
        connectedAccount: {
          accountOwner: true,
        },
      },
    });

    for (const messageChannel of messageChannels) {
      const userId = messageChannel.connectedAccount.accountOwner.userId;
      const connectedAccountId = messageChannel.connectedAccount.id;

      await this.accountsToReconnectService.addAccountToReconnectByKey(
        AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
        userId,
        workspaceId,
        connectedAccountId,
      );
    }
  }
}
