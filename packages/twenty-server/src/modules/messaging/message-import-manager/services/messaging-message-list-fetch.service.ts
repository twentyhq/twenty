import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MESSAGES_TO_IMPORT_CACHE_TTL_MS } from 'src/modules/messaging/common/constants/messages-to-import-cache-ttl-ms.constant';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { getMessagesToImportCacheKey } from 'src/modules/messaging/common/utils/get-messages-to-import-cache-key.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import { type MessagingMessagesImportJobData } from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import.job';
import { MessagingOnboardingMessagesImportJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-onboarding-messages-import.job';
import { MessagingCursorService } from 'src/modules/messaging/message-import-manager/services/messaging-cursor.service';
import { MessagingGetMessageListService } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMessagesImportService } from 'src/modules/messaging/message-import-manager/services/messaging-messages-import.service';
import {
  MessagingProcessFolderActionsService,
  type ProcessFolderActionsResult,
} from 'src/modules/messaging/message-import-manager/services/messaging-process-folder-actions.service';
import { MessagingProcessGroupEmailActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-group-email-actions.service';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

@Injectable()
export class MessagingMessageListFetchService {
  private readonly logger = new Logger(MessagingMessageListFetchService.name);
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly messagingGetMessageListService: MessagingGetMessageListService,
    private readonly messageImportErrorHandlerService: MessageImportExceptionHandlerService,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
    private readonly messagingCursorService: MessagingCursorService,
    private readonly messagingMessagesImportService: MessagingMessagesImportService,
    private readonly syncMessageFoldersService: SyncMessageFoldersService,
    private readonly messagingProcessGroupEmailActionsService: MessagingProcessGroupEmailActionsService,
    private readonly messagingProcessFolderActionsService: MessagingProcessFolderActionsService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectMessageQueue(MessageQueue.messagingOnboardingQueue)
    private readonly onboardingQueueService: MessageQueueService,
  ) {}

  public async runForMessageChannel({
    messageChannelId,
    workspaceId,
  }: {
    messageChannelId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.messagingMonitoringService.track({
      eventName: 'message_list_fetch_job.triggered',
      messageChannelId,
      workspaceId,
    });

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannel = await this.messageChannelRepository.findOne({
          where: {
            id: messageChannelId,
            workspaceId,
          },
          relations: { connectedAccount: true, messageFolders: true },
        });

        if (!isDefined(messageChannel)) {
          await this.messagingMonitoringService.track({
            eventName: 'message_list_fetch_job.error.message_channel_not_found',
            messageChannelId,
            workspaceId,
          });

          return;
        }

        if (
          messageChannel.syncStage !==
          MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED
        ) {
          return;
        }

        try {
          await this.messagingMonitoringService.track({
            eventName: 'message_list_fetch.started',
            workspaceId,
            connectedAccountId: messageChannel.connectedAccount.id,
            messageChannelId: messageChannel.id,
          });

          await this.processMessageListFetch(messageChannel, workspaceId);

          await this.messagingMonitoringService.track({
            eventName: 'message_list_fetch.completed',
            workspaceId,
            connectedAccountId: messageChannel.connectedAccount.id,
            messageChannelId: messageChannel.id,
          });
        } catch (error) {
          await this.messageImportErrorHandlerService.handleDriverException(
            error,
            MessageImportSyncStep.MESSAGE_LIST_FETCH,
            messageChannel,
            workspaceId,
          );
        }
      },
      authContext,
      { lite: true },
    );
  }

  public async processMessageListFetch(
    messageChannel: MessageChannelEntity,
    workspaceId: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        try {
          const pendingGroupEmailActionsProcessed =
            await this.processPendingGroupEmailActions(
              messageChannel,
              workspaceId,
            );

          const processedfolderActionsResult =
            await this.processPendingFolderActions(messageChannel, workspaceId);

          await this.messageChannelSyncStatusService.markAsMessagesListFetchOngoing(
            [messageChannel.id],
            workspaceId,
          );

          this.logger.log(
            `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Processing message list fetch`,
          );

          const freshMessageChannel =
            pendingGroupEmailActionsProcessed ||
            isDefined(processedfolderActionsResult)
              ? await this.messageChannelRepository.findOne({
                  where: {
                    id: messageChannel.id,
                    workspaceId,
                  },
                  relations: { connectedAccount: true, messageFolders: true },
                })
              : messageChannel;

          if (!isDefined(freshMessageChannel)) {
            this.logger.error(
              `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannel.id} - Message channel not found`,
            );

            return;
          }

          const messageFolders =
            await this.syncMessageFoldersService.syncMessageFolders({
              messageChannel: freshMessageChannel,
              workspaceId,
            });

          const messageFoldersToSync = messageFolders.filter(
            (folder) =>
              folder.pendingSyncAction === MessageFolderPendingSyncAction.NONE,
          );

          const messageLists =
            await this.messagingGetMessageListService.getMessageLists(
              freshMessageChannel,
              messageFoldersToSync,
            );

          await this.cacheStorage.del(
            getMessagesToImportCacheKey({
              workspaceId,
              messageChannelId: freshMessageChannel.id,
            }),
          );

          const messageExternalIds = [
            ...messageLists.flatMap(
              (messageList) => messageList.messageExternalIds,
            ),
            ...(processedfolderActionsResult?.messageExternalIdsToImport ?? []),
          ];

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
            `WorkspaceId: ${workspaceId}, MessageChannelId: ${freshMessageChannel.id} - Is full sync: ${isFullSync}, toImportCount: ${messageExternalIds.length}, toDeleteCount: ${messageExternalIdsToDelete.length}`,
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
              this.logger.debug(
                `messageChannelId: ${freshMessageChannel.id} Adding ${messageExternalIdsToImport.length} message external ids to import in batch ${index + 1}`,
              );

              totalMessagesToImportCount += messageExternalIdsToImport.length;

              await this.cacheStorage.setAdd(
                getMessagesToImportCacheKey({
                  workspaceId,
                  messageChannelId: freshMessageChannel.id,
                }),
                messageExternalIdsToImport,
                MESSAGES_TO_IMPORT_CACHE_TTL_MS,
              );
            }
          }

          for (const messageList of messageLists) {
            const { nextSyncCursor, folderId } = messageList;

            await this.messagingCursorService.updateCursor(
              freshMessageChannel,
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
              `WorkspaceId: ${workspaceId}, MessageChannelId: ${freshMessageChannel.id} - Deleting ${allMessageExternalIdsToDelete.length} message channel message associations`,
            );

            const toDeleteChunks = chunk(allMessageExternalIdsToDelete, 200);

            for (const [index, toDeleteChunk] of toDeleteChunks.entries()) {
              this.logger.debug(
                `messageChannelId: ${freshMessageChannel.id} Deleting ${toDeleteChunk.length} message channel message associations in batch ${index + 1}`,
              );

              await this.messagingMessageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
                {
                  workspaceId,
                  messageExternalIds: toDeleteChunk.filter(
                    (messageExternalId) => isNonEmptyString(messageExternalId),
                  ),
                  messageChannelId: freshMessageChannel.id,
                },
              );
            }
          }

          this.logger.log(
            `WorkspaceId: ${workspaceId}, MessageChannelId: ${freshMessageChannel.id} - Total messages to import count: ${totalMessagesToImportCount}`,
          );

          if (totalMessagesToImportCount === 0) {
            await this.messageChannelSyncStatusService.markAsMessageSyncCompleted(
              [freshMessageChannel.id],
              workspaceId,
            );

            return;
          }

          this.logger.debug(
            `messageChannelId: ${freshMessageChannel.id} Scheduling direct messages import`,
          );

          await this.messageChannelSyncStatusService.markAsMessagesImportScheduled(
            [freshMessageChannel.id],
            workspaceId,
          );

          const isOnboardingSync = !isDefined(freshMessageChannel.syncedAt);

          const { hasMoreMessagesToImport } =
            await this.messagingMessagesImportService.processMessageBatchImport(
              {
                messageChannel: {
                  ...freshMessageChannel,
                  syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
                },
                connectedAccount: freshMessageChannel.connectedAccount,
                workspaceId,
                messagesGetBatchSize: this.twentyConfigService.get(
                  isOnboardingSync
                    ? 'MESSAGING_ONBOARDING_FIRST_MESSAGES_GET_BATCH_SIZE'
                    : 'MESSAGING_MESSAGES_GET_BATCH_SIZE',
                ),
              },
            );

          if (isOnboardingSync && hasMoreMessagesToImport) {
            await this.chainOnboardingMessagesImport(
              freshMessageChannel.id,
              workspaceId,
            );
          }
        } catch (error) {
          await this.messageImportErrorHandlerService.handleDriverException(
            error,
            MessageImportSyncStep.MESSAGE_LIST_FETCH,
            messageChannel,
            workspaceId,
          );
        }
      },
      authContext,
      { lite: true },
    );
  }

  private async chainOnboardingMessagesImport(
    messageChannelId: string,
    workspaceId: string,
  ) {
    const claimedMessageChannelIds =
      await this.messageChannelSyncStatusService.claimPendingMessagesImport(
        [messageChannelId],
        workspaceId,
      );

    if (claimedMessageChannelIds.length === 0) {
      return;
    }

    await this.onboardingQueueService.add<MessagingMessagesImportJobData>(
      MessagingOnboardingMessagesImportJob.name,
      { workspaceId, messageChannelId },
    );
  }

  private async processPendingGroupEmailActions(
    messageChannel: MessageChannelEntity,
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
    messageChannel: MessageChannelEntity,
    workspaceId: string,
  ): Promise<ProcessFolderActionsResult | null> {
    const foldersWithPendingActions = messageChannel.messageFolders.filter(
      (folder) =>
        isDefined(folder.pendingSyncAction) &&
        folder.pendingSyncAction !== MessageFolderPendingSyncAction.NONE,
    );

    if (foldersWithPendingActions.length === 0) {
      return null;
    }

    this.logger.log(
      `messageChannelId: ${messageChannel.id} Processing pending folder actions before message list fetch`,
    );

    return this.messagingProcessFolderActionsService.processFolderActions(
      messageChannel,
      foldersWithPendingActions,
      workspaceId,
    );
  }

  private async computeFullSyncMessageChannelMessageAssociationsToDelete(
    messageChannel: Pick<MessageChannelEntity, 'id'>,
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
