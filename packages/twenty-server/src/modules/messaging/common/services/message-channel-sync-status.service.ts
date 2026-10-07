import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Any, In, Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { buildMessagesImportCacheKeys } from 'src/modules/messaging/message-import-manager/utils/build-messages-import-cache-keys.util';

@Injectable()
export class MessageChannelSyncStatusService {
  private readonly logger = new Logger(MessageChannelSyncStatusService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectWorkspaceScopedRepository(MessageFolderEntity)
    private readonly messageFolderRepository: WorkspaceScopedRepository<MessageFolderEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    private readonly metricsService: MetricsService,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  public async markAsMessagesListFetchPending(
    messageChannelIds: string[],
    workspaceId: string,
    preserveSyncStageStartedAt: boolean = false,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    await this.updateMessageChannels(messageChannelIds, workspaceId, {
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
    });
  }

  public async markAsMessagesImportPending(
    messageChannelIds: string[],
    workspaceId: string,
    preserveSyncStageStartedAt: boolean = false,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    await this.updateMessageChannels(messageChannelIds, workspaceId, {
      syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
      ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
    });
  }

  public async resetAndMarkAsMessagesListFetchPending(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    await this.cacheStorage.mdel(
      messageChannelIds.flatMap((messageChannelId) =>
        Object.values(
          buildMessagesImportCacheKeys({ workspaceId, messageChannelId }),
        ),
      ),
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.messageChannelRepository.update(
          { id: In(messageChannelIds), workspaceId },
          {
            syncCursor: '',
            syncStageStartedAt: null,
            throttleFailureCount: 0,
            throttleRetryAfter: null,
            pendingGroupEmailsAction:
              MessageChannelPendingGroupEmailsAction.NONE,
          },
        );

        await this.messageFolderRepository.update(
          workspaceId,
          { messageChannelId: In(messageChannelIds) },
          {
            syncCursor: '',
            pendingSyncAction: MessageFolderPendingSyncAction.NONE,
          },
        );
      },
      authContext,
      { lite: true },
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

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.messageChannelRepository.update(
          { id: In(messageChannelIds), workspaceId },
          { syncStageStartedAt: null },
        );
      },
      authContext,
      { lite: true },
    );
  }

  public async markAsMessagesListFetchScheduled(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    await this.updateMessageChannels(messageChannelIds, workspaceId, {
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
      syncStatus: MessageChannelSyncStatus.ONGOING,
      syncStageStartedAt: new Date().toISOString(),
    });
  }

  public async markAsMessagesListFetchScheduledIfPending(
    messageChannelIds: string[],
    workspaceId: string,
  ): Promise<string[]> {
    if (!messageChannelIds.length) {
      return [];
    }

    const updateResult = await this.messageChannelRepository
      .createQueryBuilder()
      .update()
      .set({
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
        syncStageStartedAt: new Date(),
      })
      .where({
        id: In(messageChannelIds),
        workspaceId,
        isSyncEnabled: true,
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      })
      .returning('id')
      .execute();

    return updateResult.raw.map((row: { id: string }) => row.id);
  }

  public async markAsMessagesListFetchOngoing(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    await this.updateMessageChannels(messageChannelIds, workspaceId, {
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
      syncStatus: MessageChannelSyncStatus.ONGOING,
      syncStageStartedAt: new Date().toISOString(),
    });
  }

  public async markAsMessageSyncCompleted(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    await this.updateMessageChannels(messageChannelIds, workspaceId, {
      syncStatus: MessageChannelSyncStatus.ACTIVE,
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      throttleFailureCount: 0,
      throttleRetryAfter: null,
      syncStageStartedAt: null,
      syncedAt: new Date().toISOString(),
    });

    await this.metricsService.incrementCounterForEvents({
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

    await this.updateMessageChannels(messageChannelIds, workspaceId, {
      syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
    });
  }

  public async markAsMessagesImportOngoing(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    await this.updateMessageChannels(messageChannelIds, workspaceId, {
      syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
      syncStatus: MessageChannelSyncStatus.ONGOING,
      syncStageStartedAt: new Date().toISOString(),
    });
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

    this.logger.warn(
      `Marking message channels [${messageChannelIds.join(', ')}] as ${syncStatus} in workspace ${workspaceId}`,
    );

    await this.updateMessageChannels(messageChannelIds, workspaceId, {
      syncStage: MessageChannelSyncStage.FAILED,
      syncStatus: syncStatus,
      throttleRetryAfter: null,
    });

    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const metricsKey =
          syncStatus ===
          MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS
            ? MetricsKeys.MessageChannelSyncJobFailedInsufficientPermissions
            : MetricsKeys.MessageChannelSyncJobFailedUnknown;

        await this.metricsService.incrementCounterForEvents({
          key: metricsKey,
          eventIds: messageChannelIds,
        });

        if (
          syncStatus ===
          MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS
        ) {
          const messageChannels = await this.messageChannelRepository.find({
            where: { id: In(messageChannelIds), workspaceId },
          });

          const connectedAccountIds = messageChannels.map(
            (messageChannel) => messageChannel.connectedAccountId,
          );

          await this.connectedAccountRepository.update(
            { id: Any(connectedAccountIds), workspaceId },
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
      authContext,
      { lite: true },
    );
  }

  private async updateMessageChannels(
    messageChannelIds: string[],
    workspaceId: string,
    values: QueryDeepPartialEntity<MessageChannelEntity>,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.messageChannelRepository.update(
          { id: In(messageChannelIds), workspaceId },
          values,
        );
      },
      authContext,
      { lite: true },
    );

    await this.broadcastMessageChannelsUpdated(messageChannelIds, workspaceId);
  }

  private async broadcastMessageChannelsUpdated(
    messageChannelIds: string[],
    workspaceId: string,
  ): Promise<void> {
    try {
      const messageChannels = await this.messageChannelRepository.find({
        where: { id: In(messageChannelIds), workspaceId },
        relations: { connectedAccount: true },
      });

      await this.workspaceEventBroadcaster.broadcast({
        workspaceId,
        events: messageChannels.map((messageChannel) => ({
          type: 'updated',
          entityName: 'messageChannel',
          recordId: messageChannel.id,
          properties: { after: { id: messageChannel.id } },
          recipientUserWorkspaceIds: [
            messageChannel.connectedAccount.userWorkspaceId,
          ],
        })),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to broadcast updated event for message channels [${messageChannelIds.join(', ')}] in workspace ${workspaceId}`,
        error,
      );
    }
  }

  private async addToAccountsToReconnect(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: { id: In(messageChannelIds), workspaceId },
    });

    const workspaceMemberRepository =
      this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    for (const messageChannel of messageChannels) {
      const connectedAccount = await this.connectedAccountRepository.findOne({
        where: { id: messageChannel.connectedAccountId, workspaceId },
      });

      if (!connectedAccount) {
        continue;
      }

      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: { id: connectedAccount.userWorkspaceId },
      });

      if (!userWorkspace) {
        continue;
      }

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: { userId: userWorkspace.userId },
      });

      if (!workspaceMember) {
        continue;
      }

      await this.accountsToReconnectService.addAccountToReconnectByKey(
        AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
        workspaceMember.userId,
        workspaceId,
        connectedAccount.id,
      );
    }
  }
}
