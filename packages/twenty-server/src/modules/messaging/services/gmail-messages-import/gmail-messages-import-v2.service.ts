import { Inject, Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.service';
import {
  MessageChannelWorkspaceEntity,
  MessageChannelSyncStatus,
  MessageChannelSyncSubStatus,
} from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { createQueriesFromMessageIds } from 'src/modules/messaging/utils/create-queries-from-message-ids.util';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { GMAIL_USERS_MESSAGES_GET_BATCH_SIZE } from 'src/modules/messaging/constants/gmail-users-messages-get-batch-size.constant';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { GMAIL_ONGOING_SYNC_TIMEOUT } from 'src/modules/messaging/constants/gmail-ongoing-sync-timeout.constant';
import { MessageParticipantService } from 'src/modules/messaging/services/message-participant/message-participant.service';
import { MessageService } from 'src/modules/messaging/services/message/message.service';
import { ParticipantWithMessageId } from 'src/modules/messaging/types/gmail-message';
import {
  CreateCompanyAndContactJobData,
  CreateCompanyAndContactJob,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { GmailMessagesImportService } from 'src/modules/messaging/services/gmail-messages-import/gmail-messages-import.service';

@Injectable()
export class GmailMessagesImportV2Service {
  private readonly logger = new Logger(GmailMessagesImportService.name);

  constructor(
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectCacheStorage(CacheStorageNamespace.Messaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly messageService: MessageService,
    private readonly messageParticipantService: MessageParticipantService,
  ) {}

  async processMessageBatchImport(
    workspaceId: string,
    connectedAccountId: string,
  ) {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      throw new Error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
      );
    }

    const { accessToken, refreshToken, authFailedAt } = connectedAccount;

    if (authFailedAt) {
      throw new Error(
        `Connected account ${connectedAccountId} in workspace ${workspaceId} is in a failed state. Skipping...`,
      );
    }

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const messageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!messageChannel) {
      throw new Error(
        `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    if (
      messageChannel?.syncStatus ===
        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS ||
      messageChannel?.syncStatus === MessageChannelSyncStatus.FAILED
    ) {
      throw new Error(
        `Connected account ${connectedAccountId} in workspace ${workspaceId} is in a failed state. Skipping...`,
      );
    }

    if (
      messageChannel.syncSubStatus !==
      MessageChannelSyncSubStatus.MESSAGES_IMPORT_PENDING
    ) {
      throw new Error(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} is not pending.`,
      );
    }

    const messageChannelId = messageChannel.id;

    await this.messageChannelRepository.updateSyncSubStatus(
      messageChannelId,
      MessageChannelSyncSubStatus.MESSAGES_IMPORT_ONGOING,
      workspaceId,
    );

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} starting...`,
    );

    const messageIdsToFetch =
      (await this.cacheStorage.setPop(
        `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
        GMAIL_USERS_MESSAGES_GET_BATCH_SIZE,
      )) ?? [];

    if (!messageIdsToFetch?.length) {
      await this.messageChannelRepository.updateSyncSubStatus(
        messageChannelId,
        MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
        workspaceId,
      );

      await this.messageChannelRepository.updateSyncStatus(
        messageChannelId,
        MessageChannelSyncStatus.COMPLETED,
        workspaceId,
      );

      this.logger.log(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import or delete.`,
      );

      return;
    }

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const messageQueries = createQueriesFromMessageIds(messageIdsToFetch);

    try {
      const messagesToSave =
        await this.fetchMessagesByBatchesService.fetchAllMessages(
          messageQueries,
          accessToken,
          workspaceId,
          connectedAccountId,
        );

      if (!messagesToSave.length) {
        await this.messageChannelRepository.updateSyncStatus(
          messageChannelId,
          MessageChannelSyncStatus.COMPLETED,
          workspaceId,
        );

        await this.messageChannelRepository.updateSyncSubStatus(
          messageChannelId,
          MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
          workspaceId,
        );

        return [];
      }

      const participantsWithMessageId = await workspaceDataSource?.transaction(
        async (transactionManager: EntityManager) => {
          const messageExternalIdsAndIdsMap =
            await this.messageService.saveMessagesWithinTransaction(
              messagesToSave,
              connectedAccount,
              messageChannel.id,
              workspaceId,
              transactionManager,
            );

          const participantsWithMessageId: (ParticipantWithMessageId & {
            shouldCreateContact: boolean;
          })[] = messagesToSave.flatMap((message) => {
            const messageId = messageExternalIdsAndIdsMap.get(
              message.externalId,
            );

            return messageId
              ? message.participants.map((participant) => ({
                  ...participant,
                  messageId,
                  shouldCreateContact:
                    messageChannel.isContactAutoCreationEnabled &&
                    message.participants.find((p) => p.role === 'from')
                      ?.handle === connectedAccount.handle,
                }))
              : [];
          });

          await this.messageParticipantService.saveMessageParticipants(
            participantsWithMessageId,
            workspaceId,
            transactionManager,
          );

          return participantsWithMessageId;
        },
      );

      if (messageIdsToFetch.length < GMAIL_USERS_MESSAGES_GET_BATCH_SIZE) {
        await this.messageChannelRepository.updateSyncStatus(
          messageChannelId,
          MessageChannelSyncStatus.COMPLETED,
          workspaceId,
        );

        await this.messageChannelRepository.updateSyncSubStatus(
          messageChannelId,
          MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
          workspaceId,
        );

        this.logger.log(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} done with no more messages to import.`,
        );
      } else {
        await this.messageChannelRepository.updateSyncSubStatus(
          messageChannelId,
          MessageChannelSyncSubStatus.MESSAGES_IMPORT_PENDING,
          workspaceId,
        );

        this.logger.log(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} done with more messages to import.`,
        );
      }

      if (messageChannel.isContactAutoCreationEnabled) {
        const contactsToCreate = participantsWithMessageId.filter(
          (participant) => participant.shouldCreateContact,
        );

        await this.messageQueueService.add<CreateCompanyAndContactJobData>(
          CreateCompanyAndContactJob.name,
          {
            workspaceId,
            connectedAccountHandle: connectedAccount.handle,
            contactsToCreate,
          },
        );
      }
    } catch (error) {
      await this.cacheStorage.setAdd(
        `messages-to-import:${workspaceId}:gmail:${messageChannelId}`,
        messageIdsToFetch,
      );

      await this.messageChannelRepository.updateSyncSubStatus(
        messageChannelId,
        MessageChannelSyncSubStatus.PARTIAL_MESSAGES_LIST_FETCH_PENDING,
        workspaceId,
      );

      await this.messageChannelRepository.updateSyncStatus(
        messageChannelId,
        MessageChannelSyncStatus.FAILED_UNKNOWN,
        workspaceId,
      );

      this.logger.error(
        `Error fetching messages for ${connectedAccountId} in workspace ${workspaceId}: locking for ${GMAIL_ONGOING_SYNC_TIMEOUT}ms...`,
      );

      throw new Error(
        `Error fetching messages for ${connectedAccountId} in workspace ${workspaceId}: ${error.message}`,
      );
    }
  }
}
