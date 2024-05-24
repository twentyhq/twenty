import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.service';
import {
  MessageChannelWorkspaceEntity,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { createQueriesFromMessageIds } from 'src/modules/messaging/utils/create-queries-from-message-ids.util';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { GMAIL_USERS_MESSAGES_GET_BATCH_SIZE } from 'src/modules/messaging/constants/gmail-users-messages-get-batch-size.constant';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  GmailFullMessageListFetchJobData,
  GmailFullMessageListFetchJob,
} from 'src/modules/messaging/jobs/gmail-full-message-list-fetch.job';
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
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@Injectable()
export class GmailMessagesImportService {
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
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async fetchMessageContentFromCache(
    workspaceId: string,
    connectedAccountId: string,
  ) {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      this.logger.error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const { accessToken, refreshToken, authFailedAt } = connectedAccount;

    if (authFailedAt) {
      this.logger.error(
        `Connected account ${connectedAccountId} in workspace ${workspaceId} is in a failed state. Skipping...`,
      );

      return;
    }

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const gmailMessageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!gmailMessageChannel) {
      this.logger.error(
        `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );

      return;
    }

    if (gmailMessageChannel.syncStatus !== MessageChannelSyncStatus.PENDING) {
      this.logger.log(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} is not pending.`,
      );

      if (gmailMessageChannel.syncStatus !== MessageChannelSyncStatus.ONGOING) {
        return;
      }

      const ongoingSyncStartedAt = new Date(
        gmailMessageChannel.ongoingSyncStartedAt,
      );

      if (
        ongoingSyncStartedAt < new Date(Date.now() - GMAIL_ONGOING_SYNC_TIMEOUT)
      ) {
        this.logger.log(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} failed due to ongoing sync timeout. Restarting full-sync...`,
        );

        await this.messageChannelRepository.updateSyncStatus(
          gmailMessageChannel.id,
          MessageChannelSyncStatus.FAILED,
          workspaceId,
        );

        await this.fallbackToFullSync(workspaceId, connectedAccountId);

        return;
      }

      return;
    }

    const gmailMessageChannelId = gmailMessageChannel.id;

    const messageIdsToFetch =
      (await this.cacheStorage.setPop(
        `messages-to-import:${workspaceId}:gmail:${gmailMessageChannelId}`,
        GMAIL_USERS_MESSAGES_GET_BATCH_SIZE,
      )) ?? [];

    if (!messageIdsToFetch?.length) {
      await this.messageChannelRepository.updateSyncStatus(
        gmailMessageChannelId,
        MessageChannelSyncStatus.SUCCEEDED,
        workspaceId,
      );

      this.logger.log(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} done with nothing to import or delete.`,
      );

      return;
    }

    await this.messageChannelRepository.updateSyncStatus(
      gmailMessageChannelId,
      MessageChannelSyncStatus.ONGOING,
      workspaceId,
    );

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} starting...`,
    );

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const messageQueries = createQueriesFromMessageIds(messageIdsToFetch);

    const isContactCreationForSentAndReceivedEmailsEnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId: workspaceId,
        key: FeatureFlagKeys.IsContactCreationForSentAndReceivedEmailsEnabled,
        value: true,
      });

    const isContactCreationForSentAndReceivedEmailsEnabled =
      isContactCreationForSentAndReceivedEmailsEnabledFeatureFlag?.value;

    try {
      const messagesToSave =
        await this.fetchMessagesByBatchesService.fetchAllMessages(
          messageQueries,
          accessToken,
          workspaceId,
          connectedAccountId,
        );

      const participantsWithMessageId = await workspaceDataSource?.transaction(
        async (transactionManager: EntityManager) => {
          if (!messagesToSave.length) {
            await this.messageChannelRepository.updateSyncStatus(
              gmailMessageChannelId,
              MessageChannelSyncStatus.PENDING,
              workspaceId,
            );

            return [];
          }

          const messageExternalIdsAndIdsMap =
            await this.messageService.saveMessagesWithinTransaction(
              messagesToSave,
              connectedAccount,
              gmailMessageChannel.id,
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
                    gmailMessageChannel.isContactAutoCreationEnabled &&
                    (isContactCreationForSentAndReceivedEmailsEnabled ||
                      message.participants.find((p) => p.role === 'from')
                        ?.handle === connectedAccount.handle),
                }))
              : [];
          });

          await this.messageParticipantService.saveMessageParticipants(
            participantsWithMessageId,
            workspaceId,
            transactionManager,
          );

          if (messageIdsToFetch.length < GMAIL_USERS_MESSAGES_GET_BATCH_SIZE) {
            await this.messageChannelRepository.updateSyncStatus(
              gmailMessageChannelId,
              MessageChannelSyncStatus.SUCCEEDED,
              workspaceId,
              transactionManager,
            );

            this.logger.log(
              `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} done with no more messages to import.`,
            );
          } else {
            await this.messageChannelRepository.updateSyncStatus(
              gmailMessageChannelId,
              MessageChannelSyncStatus.PENDING,
              workspaceId,
              transactionManager,
            );

            this.logger.log(
              `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} done with more messages to import.`,
            );
          }

          return participantsWithMessageId;
        },
      );

      if (gmailMessageChannel.isContactAutoCreationEnabled) {
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
        `messages-to-import:${workspaceId}:gmail:${gmailMessageChannelId}`,
        messageIdsToFetch,
      );

      await this.messageChannelRepository.updateSyncStatus(
        gmailMessageChannelId,
        MessageChannelSyncStatus.FAILED,
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

  private async fallbackToFullSync(
    workspaceId: string,
    connectedAccountId: string,
  ) {
    await this.messageQueueService.add<GmailFullMessageListFetchJobData>(
      GmailFullMessageListFetchJob.name,
      { workspaceId, connectedAccountId },
    );
  }
}
