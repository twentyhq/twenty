import { Injectable } from '@nestjs/common';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class MessagingChannelSyncStatusService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  public async scheduleFullMessageListFetch(messageChannelId: string) {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        id: messageChannelId,
      },
      {
        syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
      },
    );
  }

  public async schedulePartialMessageListFetch(messageChannelId: string) {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        id: messageChannelId,
      },
      {
        syncStage: MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
      },
    );
  }

  public async scheduleMessagesImport(messageChannelId: string) {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        id: messageChannelId,
      },
      {
        syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
      },
    );
  }

  public async resetAndScheduleFullMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
    );

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        id: messageChannelId,
      },
      {
        syncCursor: '',
        syncStageStartedAt: null,
        throttleFailureCount: 0,
      },
    );

    await this.scheduleFullMessageListFetch(messageChannelId);
  }

  public async markAsMessagesListFetchOngoing(messageChannelId: string) {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        id: messageChannelId,
      },
      {
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
        syncStatus: MessageChannelSyncStatus.ONGOING,
      },
    );
  }

  public async markAsCompletedAndSchedulePartialMessageListFetch(
    messageChannelId: string,
  ) {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        id: messageChannelId,
      },
      {
        syncStatus: MessageChannelSyncStatus.ACTIVE,
      },
    );

    await this.schedulePartialMessageListFetch(messageChannelId);
  }

  public async markAsMessagesImportOngoing(messageChannelId: string) {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        id: messageChannelId,
      },
      {
        syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
      },
    );
  }

  public async markAsFailedUnknownAndFlushMessagesToImport(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
    );

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        id: messageChannelId,
      },
      {
        syncStage: MessageChannelSyncStage.FAILED,
        syncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
      },
    );
  }

  public async markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
    );

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        id: messageChannelId,
      },
      {
        syncStage: MessageChannelSyncStage.FAILED,
        syncStatus: MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      },
    );

    await this.addToAccountsToReconnect(messageChannelId, workspaceId);
  }

  private async addToAccountsToReconnect(
    messageChannelId: string,
    workspaceId: string,
  ) {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: {
        id: messageChannelId,
      },
      relations: {
        connectedAccount: {
          accountOwner: true,
        },
      },
    });

    if (!messageChannel) {
      return;
    }

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
