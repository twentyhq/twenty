import { Injectable } from '@nestjs/common';

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
export class MessagingFullMessageListFetchService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messagingGetMessageListService: MessagingGetMessageListService,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
  ) {}

  public async processMessageListFetch(
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    try {
      await this.messageChannelSyncStatusService.markAsMessagesListFetchOngoing(
        [messageChannel.id],
      );

      const { messageExternalIds, nextSyncCursor } =
        await this.messagingGetMessageListService.getFullMessageList(
          connectedAccount,
        );

      const messageChannelMessageAssociationRepository =
        await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
          'messageChannelMessageAssociation',
        );

      const existingMessageChannelMessageAssociations =
        await messageChannelMessageAssociationRepository.find({
          where: {
            messageChannelId: messageChannel.id,
          },
        });

      const existingMessageChannelMessageAssociationsExternalIds =
        existingMessageChannelMessageAssociations.map(
          (messageChannelMessageAssociation) =>
            messageChannelMessageAssociation.messageExternalId,
        );

      const messageExternalIdsToImport = messageExternalIds.filter(
        (messageExternalId) =>
          !existingMessageChannelMessageAssociationsExternalIds.includes(
            messageExternalId,
          ),
      );

      const messageExternalIdsToDelete =
        existingMessageChannelMessageAssociationsExternalIds.filter(
          (existingMessageCMAExternalId) =>
            existingMessageCMAExternalId &&
            !messageExternalIds.includes(existingMessageCMAExternalId),
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

      if (messageExternalIdsToImport.length) {
        await this.cacheStorage.setAdd(
          `messages-to-import:${workspaceId}:${messageChannel.id}`,
          messageExternalIdsToImport,
        );
      }

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
          syncStageStartedAt: null,
          syncCursor:
            !messageChannel.syncCursor ||
            nextSyncCursor > messageChannel.syncCursor
              ? nextSyncCursor
              : messageChannel.syncCursor,
        },
      );

      await this.messageChannelSyncStatusService.scheduleMessagesImport([
        messageChannel.id,
      ]);
    } catch (error) {
      await this.messageImportErrorHandlerService.handleDriverException(
        error,
        MessageImportSyncStep.FULL_MESSAGE_LIST_FETCH,
        messageChannel,
        workspaceId,
      );
    }
  }
}
