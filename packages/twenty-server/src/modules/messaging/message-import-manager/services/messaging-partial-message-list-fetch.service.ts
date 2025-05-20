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
import { MessagingCursorService } from 'src/modules/messaging/message-import-manager/services/messaging-cursor.service';
import { MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';

@Injectable()
export class MessagingPartialMessageListFetchService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messagingGetMessageListService: MessagingGetMessageListService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
    private readonly messagingCursorService: MessagingCursorService,
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

      const partialMessageLists =
        await this.messagingGetMessageListService.getPartialMessageLists(
          messageChannel,
        );

      for (const partialMessageList of partialMessageLists) {
        const {
          messageExternalIds,
          messageExternalIdsToDelete,
          nextSyncCursor,
          folderId,
        } = partialMessageList;

        await this.cacheStorage.setAdd(
          `messages-to-import:${workspaceId}:${messageChannel.id}`,
          messageExternalIds,
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

        await this.messagingCursorService.updateCursor(
          messageChannel,
          nextSyncCursor,
          folderId,
        );
      }

      const isPartialImportFinishedForAllFolders = partialMessageLists.every(
        (partialMessageList) =>
          this.isPartialImportFinished(
            partialMessageList.previousSyncCursor,
            partialMessageList.nextSyncCursor,
          ),
      );

      if (isPartialImportFinishedForAllFolders) {
        await this.messageChannelSyncStatusService.markAsCompletedAndSchedulePartialMessageListFetch(
          [messageChannel.id],
        );

        return;
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

  private isPartialImportFinished(
    previousSyncCursor: string,
    nextSyncCursor: string,
  ): boolean {
    return previousSyncCursor === nextSyncCursor;
  }
}
