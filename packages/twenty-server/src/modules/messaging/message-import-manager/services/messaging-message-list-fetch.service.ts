import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { MessagingAccountAuthenticationService } from 'src/modules/messaging/message-import-manager/services/messaging-account-authentication.service';
import { MessagingCursorService } from 'src/modules/messaging/message-import-manager/services/messaging-cursor.service';
import { MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';

const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class MessagingMessageListFetchService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messagingGetMessageListService: MessagingGetMessageListService,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
    private readonly messagingCursorService: MessagingCursorService,
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
    private readonly messagingAccountAuthenticationService: MessagingAccountAuthenticationService,
  ) {}

  public async processMessageListFetch(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ) {
    try {
      await this.messageChannelSyncStatusService.markAsMessagesListFetchOngoing(
        [messageChannel.id],
      );

      const { accessToken, refreshToken } =
        await this.messagingAccountAuthenticationService.validateAndRefreshConnectedAccountAuthentication(
          {
            connectedAccount: messageChannel.connectedAccount,
            workspaceId,
            messageChannelId: messageChannel.id,
          },
        );

      const messageChannelWithFreshTokens = {
        ...messageChannel,
        connectedAccount: {
          ...messageChannel.connectedAccount,
          accessToken,
          refreshToken,
        },
      };

      const messageLists =
        await this.messagingGetMessageListService.getMessageLists(
          messageChannelWithFreshTokens,
        );

      await this.cacheStorage.del(
        `messages-to-import:${workspaceId}:${messageChannel.id}`,
      );

      const totalMessageCount = messageLists.reduce(
        (acc, messageList) => acc + messageList.messageExternalIds.length,
        0,
      );

      for (const messageList of messageLists) {
        if (messageList.messageExternalIds.length === 0) {
          continue;
        }

        const {
          messageExternalIds,
          nextSyncCursor,
          folderId,
          messageExternalIdsToDelete,
          previousSyncCursor,
        } = messageList;

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

        const isFullSync = !previousSyncCursor;

        const additionalMessageExternalIdsToDelete = isFullSync
          ? existingMessageChannelMessageAssociationsExternalIds.filter(
              (existingMessageCMAExternalId) =>
                existingMessageCMAExternalId &&
                !messageExternalIds.includes(existingMessageCMAExternalId),
            )
          : [];

        const allMessageExternalIdsToDelete = [
          ...messageExternalIdsToDelete,
          ...additionalMessageExternalIdsToDelete,
        ];

        if (allMessageExternalIdsToDelete.length) {
          await messageChannelMessageAssociationRepository.delete({
            messageChannelId: messageChannelWithFreshTokens.id,
            messageExternalId: In(allMessageExternalIdsToDelete),
          });

          await this.messagingMessageCleanerService.cleanWorkspaceThreads(
            workspaceId,
          );
        }

        if (messageExternalIdsToImport.length) {
          await this.cacheStorage.setAdd(
            `messages-to-import:${workspaceId}:${messageChannelWithFreshTokens.id}`,
            messageExternalIdsToImport,
            ONE_WEEK_IN_MILLISECONDS,
          );
        }

        await this.messagingCursorService.updateCursor(
          messageChannelWithFreshTokens,
          nextSyncCursor,
          folderId,
        );
      }

      if (totalMessageCount === 0) {
        await this.messageChannelSyncStatusService.markAsCompletedAndScheduleMessageListFetch(
          [messageChannelWithFreshTokens.id],
        );
      }

      await this.messageChannelSyncStatusService.scheduleMessagesImport([
        messageChannelWithFreshTokens.id,
      ]);

      await this.messagingMessagesImportService.processMessageBatchImport(
        {
          ...messageChannelWithFreshTokens,
          syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
        },
        messageChannelWithFreshTokens.connectedAccount,
        workspaceId,
      );
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
