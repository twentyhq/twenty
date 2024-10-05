import { Injectable, Logger } from '@nestjs/common';

import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/message-import-exception-handler.service';
import { MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';

@Injectable()
export class MessagingPartialMessageListFetchService {
  private readonly logger = new Logger(
    MessagingPartialMessageListFetchService.name,
  );

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messagingGetMessageListService: MessagingGetMessageListService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
  ) {}

  public async processMessageListFetch(
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    try {
      await this.messageChannelSyncStatusService.markAsMessagesListFetchOngoing(
        [messageChannel.id],
      );

      const messageChannelRepository =
        await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
          'messageChannel',
        );

      await messageChannelRepository.update(
        {
          id: messageChannel.id,
        },
        {
          throttleFailureCount: 0,
        },
      );

      const syncCursor = messageChannel.syncCursor;

      const { messageExternalIds, messageExternalIdsToDelete, nextSyncCursor } =
        await this.messagingGetMessageListService.getPartialMessageList(
          connectedAccount,
          syncCursor,
        );

      if (syncCursor === nextSyncCursor) {
        this.logger.log(
          `Partial message list import done with history ${syncCursor} and nothing to update for workspace ${workspaceId} and account ${connectedAccount.id}`,
        );

        await this.messageChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
          [messageChannel.id],
        );

        return;
      }

      await this.cacheStorage.setAdd(
        `messages-to-import:${workspaceId}:${messageChannel.id}`,
        messageExternalIds,
      );

      this.logger.log(
        `Added ${messageExternalIds.length} messages to import for workspace ${workspaceId} and account ${connectedAccount.id}`,
      );

      const messageChannelMessageAssociationRepository =
        await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
          'messageChannelMessageAssociation',
        );

      if (messageExternalIdsToDelete.length) {
        await messageChannelMessageAssociationRepository.delete({
          messageChannelId: messageChannel.id,
          messageExternalId: In(messageExternalIdsToDelete),
        });

        await this.messagingMessageCleanerService.cleanWorkspaceThreads(
          workspaceId,
        );
      }

      this.logger.log(
        `Deleted ${messageExternalIdsToDelete.length} messages for workspace ${workspaceId} and account ${connectedAccount.id}`,
      );

      if (!syncCursor || nextSyncCursor > syncCursor) {
        await messageChannelRepository.update(
          {
            id: messageChannel.id,
          },
          {
            syncCursor: nextSyncCursor,
          },
        );
      }

      await this.messageChannelSyncStatusService.scheduleMessagesImport([
        messageChannel.id,
      ]);
    } catch (error) {
      await this.messageImportErrorHandlerService.handleDriverException(
        error,
        MessageImportSyncStep.PARTIAL_MESSAGE_LIST_FETCH,
        messageChannel,
        workspaceId,
      );
    }
  }
}
