import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThanOrEqual } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
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
  private readonly logger = new Logger(MessagingMessageListFetchService.name);
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

      this.logger.log(
        `messageChannelId: ${messageChannel.id} Processing message list fetch`,
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

      const messageExternalIds = messageLists.flatMap(
        (messageList) => messageList.messageExternalIds,
      );

      const messageExternalIdsToDelete = messageLists.flatMap(
        (messageList) => messageList.messageExternalIdsToDelete,
      );

      const isFullSync =
        messageLists.every(
          (messageList) => !isNonEmptyString(messageList.previousSyncCursor),
        ) && !isNonEmptyString(messageChannel.syncCursor);

      let totalMessagesToImportCount = 0;

      this.logger.log(
        `messageChannelId: ${messageChannel.id} Is full sync: ${isFullSync} and toImportCount: ${messageExternalIds.length}, toDeleteCount: ${messageExternalIdsToDelete.length}`,
      );

      const messageChannelMessageAssociationRepository =
        await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
          'messageChannelMessageAssociation',
        );

      const messageExternalIdsChunks = chunk(messageExternalIds, 200);

      for (const [
        index,
        messageExternalIdsChunk,
      ] of messageExternalIdsChunks.entries()) {
        const existingMessageChannelMessageAssociations =
          await messageChannelMessageAssociationRepository.find({
            where: {
              messageChannelId: messageChannel.id,
              messageExternalId: In(messageExternalIdsChunk),
            },
          });

        const existingMessageChannelMessageAssociationsExternalIds =
          existingMessageChannelMessageAssociations.map(
            (messageChannelMessageAssociation) =>
              messageChannelMessageAssociation.messageExternalId,
          );

        const messageExternalIdsToImport = messageExternalIdsChunk.filter(
          (messageExternalId) =>
            !existingMessageChannelMessageAssociationsExternalIds.includes(
              messageExternalId,
            ),
        );

        if (messageExternalIdsToImport.length) {
          this.logger.log(
            `messageChannelId: ${messageChannel.id} Adding ${messageExternalIdsToImport.length} message external ids to import in batch ${index + 1}`,
          );

          totalMessagesToImportCount += messageExternalIdsToImport.length;

          await this.cacheStorage.setAdd(
            `messages-to-import:${workspaceId}:${messageChannelWithFreshTokens.id}`,
            messageExternalIdsToImport,
            ONE_WEEK_IN_MILLISECONDS,
          );
        }
      }

      for (const messageList of messageLists) {
        const { nextSyncCursor, folderId } = messageList;

        await this.messagingCursorService.updateCursor(
          messageChannelWithFreshTokens,
          nextSyncCursor,
          folderId,
        );
      }

      const fullSyncMessageChannelMessageAssociationsToDelete = isFullSync
        ? await this.computeFullSyncMessageChannelMessageAssociationsToDelete(
            messageChannel,
            messageExternalIds,
          )
        : [];

      const allMessageExternalIdsToDelete = [
        ...messageExternalIdsToDelete,
        ...fullSyncMessageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociation) =>
            messageChannelMessageAssociation.messageExternalId,
        ),
      ];

      if (allMessageExternalIdsToDelete.length) {
        this.logger.log(
          `messageChannelId: ${messageChannel.id} Deleting ${allMessageExternalIdsToDelete.length} message channel message associations`,
        );

        const toDeleteChunks = chunk(allMessageExternalIdsToDelete, 200);

        for (const [index, toDeleteChunk] of toDeleteChunks.entries()) {
          await messageChannelMessageAssociationRepository.delete({
            messageChannelId: messageChannelWithFreshTokens.id,
            messageExternalId: In(toDeleteChunk),
          });

          this.logger.log(
            `messageChannelId: ${messageChannel.id} Deleted ${toDeleteChunk.length} message channel message associations in batch ${index + 1}`,
          );
        }
      }

      this.logger.log(
        `messageChannelId: ${messageChannel.id} launching workspace thread cleanup`,
      );

      await this.messagingMessageCleanerService.cleanWorkspaceThreads(
        workspaceId,
      );

      this.logger.log(
        `messageChannelId: ${messageChannel.id} Total messages to import count: ${totalMessagesToImportCount}`,
      );

      if (totalMessagesToImportCount === 0) {
        await this.messageChannelSyncStatusService.markAsCompletedAndScheduleMessageListFetch(
          [messageChannelWithFreshTokens.id],
        );

        return;
      }

      this.logger.log(
        `messageChannelId: ${messageChannel.id} Scheduling direct messages import`,
      );

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

  private async computeFullSyncMessageChannelMessageAssociationsToDelete(
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    messageExternalIds: string[],
  ) {
    const messageChannelMessageAssociationRepository =
      await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        'messageChannelMessageAssociation',
      );

    const fullSyncMessageChannelMessageAssociationsToDelete = [];

    const firstMessageChannelMessageAssociation =
      await messageChannelMessageAssociationRepository.findOne({
        where: {
          messageChannelId: messageChannel.id,
        },
        order: {
          id: 'ASC',
        },
      });

    if (!isDefined(firstMessageChannelMessageAssociation)) {
      this.logger.log(
        `messageChannelId: ${messageChannel.id} Full sync: No message channel message associations found`,
      );

      return [];
    }

    this.logger.log(
      `messageChannelId: ${messageChannel.id} Full sync: First message channel message association id: ${firstMessageChannelMessageAssociation.id}`,
    );

    let nextFirstBatchMessageChannelMessageAssociationId: string | undefined =
      firstMessageChannelMessageAssociation.id;
    let batchIndex = 0;

    while (isDefined(nextFirstBatchMessageChannelMessageAssociationId)) {
      const existingMessageChannelMessageAssociations =
        await messageChannelMessageAssociationRepository.find({
          where: {
            messageChannelId: messageChannel.id,
            id: MoreThanOrEqual(
              nextFirstBatchMessageChannelMessageAssociationId,
            ),
          },
          order: {
            id: 'ASC',
          },
          take: 200,
        });

      const messageChannelMessageAssociationsToDelete =
        existingMessageChannelMessageAssociations.filter(
          (existingMessageChannelMessageAssociation) =>
            isDefined(
              existingMessageChannelMessageAssociation.messageExternalId,
            ) &&
            !messageExternalIds.includes(
              existingMessageChannelMessageAssociation.messageExternalId,
            ),
        );

      this.logger.log(
        `messageChannelId: ${messageChannel.id} Full sync: Message channel message associations to delete in batch ${batchIndex}: ${messageChannelMessageAssociationsToDelete.length}`,
      );

      fullSyncMessageChannelMessageAssociationsToDelete.push(
        ...messageChannelMessageAssociationsToDelete,
      );

      if (existingMessageChannelMessageAssociations.length < 200) {
        nextFirstBatchMessageChannelMessageAssociationId = undefined;
        break;
      }

      nextFirstBatchMessageChannelMessageAssociationId =
        existingMessageChannelMessageAssociations[
          existingMessageChannelMessageAssociations.length - 1
        ].id;

      batchIndex++;
    }

    return fullSyncMessageChannelMessageAssociationsToDelete;
  }
}
