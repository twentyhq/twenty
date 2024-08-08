import { Injectable } from '@nestjs/common';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class MessagingChannelSyncStatusService {
  constructor(
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  public async scheduleFullMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
      workspaceId,
    );
  }

  public async schedulePartialMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
      workspaceId,
    );
  }

  public async scheduleMessagesImport(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
      workspaceId,
    );
  }

  public async resetAndScheduleFullMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
    );

    await this.messageChannelRepository.resetSyncCursor(
      messageChannelId,
      workspaceId,
    );

    await this.messageChannelRepository.resetSyncStageStartedAt(
      messageChannelId,
      workspaceId,
    );

    await this.messageChannelRepository.resetThrottleFailureCount(
      messageChannelId,
      workspaceId,
    );

    await this.scheduleFullMessageListFetch(messageChannelId, workspaceId);
  }

  public async markAsMessagesListFetchOngoing(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.ONGOING,
      workspaceId,
    );
  }

  public async markAsCompletedAndSchedulePartialMessageListFetch(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.ACTIVE,
      workspaceId,
    );

    await this.schedulePartialMessageListFetch(messageChannelId, workspaceId);
  }

  public async markAsMessagesImportOngoing(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
      workspaceId,
    );
  }

  public async markAsFailedUnknownAndFlushMessagesToImport(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
    );

    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.FAILED,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.FAILED_UNKNOWN,
      workspaceId,
    );
  }

  public async markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
    messageChannelId: string,
    workspaceId: string,
  ) {
    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
    );

    await this.messageChannelRepository.updateSyncStage(
      messageChannelId,
      MessageChannelSyncStage.FAILED,
      workspaceId,
    );

    await this.messageChannelRepository.updateSyncStatus(
      messageChannelId,
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      workspaceId,
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
