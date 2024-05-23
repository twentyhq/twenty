import { Inject, Injectable, Logger } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { FetchMessagesByBatchesService } from 'src/modules/messaging/services/fetch-messages-by-batches/fetch-messages-by-batches.service';
import {
  MessageChannelWorkspaceEntity,
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
import { SetMessageChannelSyncStatusService } from 'src/modules/messaging/services/set-message-channel-sync-status/set-message-channel-sync-status.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

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
    private readonly setMessageChannelSyncStatusService: SetMessageChannelSyncStatusService,
  ) {}

  async processMessageBatchImport(
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    workspaceId: string,
  ) {
    if (messageChannel.syncSubStatus === MessageChannelSyncSubStatus.FAILED) {
      throw new Error(
        `Connected account ${connectedAccount.id} in workspace ${workspaceId} is in a failed state. Skipping...`,
      );
    }

    if (
      messageChannel.syncSubStatus !==
      MessageChannelSyncSubStatus.MESSAGES_IMPORT_PENDING
    ) {
      throw new Error(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} is not pending.`,
      );
    }

    await this.setMessageChannelSyncStatusService.setMessagesImportOnGoingStatus(
      messageChannel.id,
      workspaceId,
    );

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} starting...`,
    );

    const messageIdsToFetch =
      (await this.cacheStorage.setPop(
        `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
        GMAIL_USERS_MESSAGES_GET_BATCH_SIZE,
      )) ?? [];

    if (!messageIdsToFetch?.length) {
      await this.setMessageChannelSyncStatusService.setCompletedStatus(
        messageChannel.id,
        workspaceId,
      );

      this.logger.log(
        `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} done with nothing to import or delete.`,
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
          connectedAccount.accessToken,
          workspaceId,
          connectedAccount.id,
        );

      if (!messagesToSave.length) {
        await this.setMessageChannelSyncStatusService.setCompletedStatus(
          messageChannel.id,
          workspaceId,
        );

        return [];
      }

      const participantsWithMessageId =
        await this.saveMessagesAndParticipantsAndReturnParticipantsWithMessageId(
          messagesToSave,
          connectedAccount,
          messageChannel,
          workspaceId,
          workspaceDataSource,
        );

      if (messageIdsToFetch.length < GMAIL_USERS_MESSAGES_GET_BATCH_SIZE) {
        await this.setMessageChannelSyncStatusService.setCompletedStatus(
          messageChannel.id,
          workspaceId,
        );

        this.logger.log(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} done with no more messages to import.`,
        );
      } else {
        await this.setMessageChannelSyncStatusService.setMessagesImportPendingStatus(
          messageChannel.id,
          workspaceId,
        );

        this.logger.log(
          `Messaging import for workspace ${workspaceId} and account ${connectedAccount.id} done with more messages to import.`,
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
        `messages-to-import:${workspaceId}:gmail:${messageChannel.id}`,
        messageIdsToFetch,
      );

      await this.setMessageChannelSyncStatusService.setFailedUnkownStatus(
        messageChannel.id,
        workspaceId,
      );

      this.logger.error(
        `Error fetching messages for ${connectedAccount.id} in workspace ${workspaceId}: locking for ${GMAIL_ONGOING_SYNC_TIMEOUT}ms...`,
      );

      throw new Error(
        `Error fetching messages for ${connectedAccount.id} in workspace ${workspaceId}: ${error.message}`,
      );
    }
  }

  public async saveMessagesAndParticipantsAndReturnParticipantsWithMessageId(
    messagesToSave: any[],
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>,
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>,
    workspaceId: string,
    workspaceDataSource: DataSource,
  ) {
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
          const messageId = messageExternalIdsAndIdsMap.get(message.externalId);

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

    return participantsWithMessageId;
  }
}
