import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThanOrEqual } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
  MessageFolderImportPolicy,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import { MessagingAccountAuthenticationService } from 'src/modules/messaging/message-import-manager/services/messaging-account-authentication.service';
import { MessagingCursorService } from 'src/modules/messaging/message-import-manager/services/messaging-cursor.service';
import { MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import { MessagingProcessFolderActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-folder-actions.service';
import { MessagingProcessGroupEmailActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-group-email-actions.service';

const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class MessagingMessageListFetchService {
  private readonly logger = new Logger(MessagingMessageListFetchService.name);
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messagingGetMessageListService: MessagingGetMessageListService,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
    private readonly messagingCursorService: MessagingCursorService,
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
    private readonly messagingAccountAuthenticationService: MessagingAccountAuthenticationService,
    private readonly syncMessageFoldersService: SyncMessageFoldersService,
    private readonly messagingProcessGroupEmailActionsService: MessagingProcessGroupEmailActionsService,
    private readonly messagingProcessFolderActionsService: MessagingProcessFolderActionsService,
  ) {}

  public async processMessageListFetch(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        try {
          const pendingGroupEmailActionsProcessed =
            await this.processPendingGroupEmailActions(
              messageChannel,
              workspaceId,
            );

          const pendingFolderActionsProcessed =
            await this.processPendingFolderActions(messageChannel, workspaceId);

          await this.messageChannelSyncStatusService.markAsMessagesListFetchOngoing(
            [messageChannel.id],
            workspaceId,
          );

          this.logger.log(
            `messageChannelId: ${messageChannel.id} Processing message list fetch`,
          );

          const messageChannelRepository =
            await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
              workspaceId,
              'messageChannel',
            );

          const freshMessageChannel =
            pendingGroupEmailActionsProcessed || pendingFolderActionsProcessed
              ? await messageChannelRepository.findOne({
                  where: {
                    id: messageChannel.id,
                  },
                  relations: ['connectedAccount', 'messageFolders'],
                })
              : messageChannel;

          if (!isDefined(freshMessageChannel)) {
            this.logger.error(
              `error processing message list fetch: messageChannelId: ${messageChannel.id} Message channel not found`,
            );

            return;
          }

          const { accessToken, refreshToken } =
            await this.messagingAccountAuthenticationService.validateAndRefreshConnectedAccountAuthentication(
              {
                connectedAccount: freshMessageChannel.connectedAccount,
                workspaceId,
                messageChannelId: freshMessageChannel.id,
              },
            );

          const messageChannelWithFreshTokens = {
            ...freshMessageChannel,
            connectedAccount: {
              ...freshMessageChannel.connectedAccount,
              accessToken,
              refreshToken,
            },
          };

          const messageFolders =
            await this.syncMessageFoldersService.syncMessageFolders({
              messageChannel: messageChannelWithFreshTokens,
              workspaceId,
            });

          const messageFoldersToSync = (
            messageChannelWithFreshTokens.messageFolderImportPolicy ===
            MessageFolderImportPolicy.ALL_FOLDERS
              ? messageFolders
              : messageFolders.filter((folder) => folder.isSynced)
          ).filter(
            (folder) =>
              folder.pendingSyncAction === MessageFolderPendingSyncAction.NONE,
          );

          const messageLists =
            await this.messagingGetMessageListService.getMessageLists(
              messageChannelWithFreshTokens,
              messageFoldersToSync,
            );

          await this.cacheStorage.del(
            `messages-to-import:${workspaceId}:${freshMessageChannel.id}`,
          );

          const messageExternalIds = messageLists.flatMap(
            (messageList) => messageList.messageExternalIds,
          );

          const messageExternalIdsToDelete = messageLists.flatMap(
            (messageList) => messageList.messageExternalIdsToDelete,
          );

          const isFullSync =
            messageLists.every(
              (messageList) =>
                !isNonEmptyString(messageList.previousSyncCursor),
            ) && !isNonEmptyString(freshMessageChannel.syncCursor);

          let totalMessagesToImportCount = 0;

          this.logger.log(
            `messageChannelId: ${freshMessageChannel.id} Is full sync: ${isFullSync} and toImportCount: ${messageExternalIds.length}, toDeleteCount: ${messageExternalIdsToDelete.length}, cursors: ${messageLists.map(
              (messageList) => {
                messageList.nextSyncCursor;
              },
            )}`,
          );

          const messageChannelMessageAssociationRepository =
            await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
              workspaceId,
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
                  messageChannelId: freshMessageChannel.id,
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
                `messageChannelId: ${freshMessageChannel.id} Adding ${messageExternalIdsToImport.length} message external ids to import in batch ${index + 1}`,
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
              workspaceId,
              folderId,
            );
          }

          const fullSyncMessageChannelMessageAssociationsToDelete = isFullSync
            ? await this.computeFullSyncMessageChannelMessageAssociationsToDelete(
                freshMessageChannel,
                messageExternalIds,
                workspaceId,
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
              `messageChannelId: ${freshMessageChannel.id} Deleting ${allMessageExternalIdsToDelete.length} message channel message associations`,
            );

            const toDeleteChunks = chunk(allMessageExternalIdsToDelete, 200);

            for (const [index, toDeleteChunk] of toDeleteChunks.entries()) {
              this.logger.log(
                `messageChannelId: ${freshMessageChannel.id} Deleting ${toDeleteChunk.length} message channel message associations in batch ${index + 1}`,
              );

              await this.messagingMessageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
                {
                  workspaceId,
                  messageExternalIds: toDeleteChunk.filter(
                    (messageExternalId) => isNonEmptyString(messageExternalId),
                  ),
                  messageChannelId: messageChannelWithFreshTokens.id,
                },
              );
            }
          }

          this.logger.log(
            `messageChannelId: ${freshMessageChannel.id} Total messages to import count: ${totalMessagesToImportCount}`,
          );

          if (totalMessagesToImportCount === 0) {
            await this.messageChannelSyncStatusService.markAsCompletedAndMarkAsMessagesListFetchPending(
              [messageChannelWithFreshTokens.id],
              workspaceId,
            );

            return;
          }

          this.logger.log(
            `messageChannelId: ${freshMessageChannel.id} Scheduling direct messages import`,
          );

          await this.messageChannelSyncStatusService.markAsMessagesImportScheduled(
            [messageChannelWithFreshTokens.id],
            workspaceId,
          );

          await this.messagingMessagesImportService.processMessageBatchImport(
            {
              ...messageChannelWithFreshTokens,
              syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
            },
            messageChannelWithFreshTokens.connectedAccount,
            workspaceId,
          );
        } catch (error) {
          await this.messageImportErrorHandlerService.handleDriverException(
            error,
            MessageImportSyncStep.MESSAGE_LIST_FETCH,
            messageChannel,
            workspaceId,
          );
        }
      },
    );
  }

  private async processPendingGroupEmailActions(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<boolean> {
    const hasPendingGroupEmailAction =
      messageChannel.pendingGroupEmailsAction ===
        MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION ||
      messageChannel.pendingGroupEmailsAction ===
        MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT;

    if (!hasPendingGroupEmailAction) {
      return false;
    }

    this.logger.log(
      `messageChannelId: ${messageChannel.id} Processing pending group emails action before message list fetch: ${messageChannel.pendingGroupEmailsAction}`,
    );

    await this.messagingProcessGroupEmailActionsService.processGroupEmailActions(
      messageChannel,
      workspaceId,
    );

    return true;
  }

  private async processPendingFolderActions(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<boolean> {
    const foldersWithPendingActions = messageChannel.messageFolders.filter(
      (folder) =>
        isDefined(folder.pendingSyncAction) &&
        folder.pendingSyncAction !== MessageFolderPendingSyncAction.NONE,
    );

    if (foldersWithPendingActions.length === 0) {
      return false;
    }

    this.logger.log(
      `messageChannelId: ${messageChannel.id} Processing pending folder actions before message list fetch`,
    );

    await this.messagingProcessFolderActionsService.processFolderActions(
      messageChannel,
      foldersWithPendingActions,
      workspaceId,
    );

    return true;
  }

  private async computeFullSyncMessageChannelMessageAssociationsToDelete(
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    messageExternalIds: string[],
    workspaceId: string,
  ) {
    const messageChannelMessageAssociationRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        workspaceId,
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
