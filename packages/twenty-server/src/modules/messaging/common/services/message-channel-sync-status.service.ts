import { Injectable } from '@nestjs/common';

import { Any } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class MessageChannelSyncStatusService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  public async scheduleFullMessageListFetch(messageChannelIds: string[]) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
    });
  }

  public async schedulePartialMessageListFetch(messageChannelIds: string[]) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncStage: MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
    });
  }

  public async scheduleMessagesImport(messageChannelIds: string[]) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
    });
  }

  public async resetAndScheduleFullMessageListFetch(
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

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncCursor: '',
      syncStageStartedAt: null,
      throttleFailureCount: 0,
    });

    await this.scheduleFullMessageListFetch(messageChannelIds);
  }

  public async resetSyncStageStartedAt(messageChannelIds: string[]) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncStageStartedAt: null,
    });
  }

  public async markAsMessagesListFetchOngoing(messageChannelIds: string[]) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
      syncStatus: MessageChannelSyncStatus.ONGOING,
      syncStageStartedAt: new Date().toISOString(),
    });
  }

  public async markAsCompletedAndSchedulePartialMessageListFetch(
    messageChannelIds: string[],
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncStatus: MessageChannelSyncStatus.ACTIVE,
      syncStage: MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
      throttleFailureCount: 0,
      syncStageStartedAt: null,
      syncedAt: new Date().toISOString(),
    });
  }

  public async markAsMessagesImportOngoing(messageChannelIds: string[]) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
      syncStageStartedAt: new Date().toISOString(),
    });
  }

  public async markAsFailedUnknownAndFlushMessagesToImport(
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

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncStage: MessageChannelSyncStage.FAILED,
      syncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
    });
  }

  public async markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
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

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(messageChannelIds, {
      syncStage: MessageChannelSyncStage.FAILED,
      syncStatus: MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    });

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
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

  private async addToAccountsToReconnect(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
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
