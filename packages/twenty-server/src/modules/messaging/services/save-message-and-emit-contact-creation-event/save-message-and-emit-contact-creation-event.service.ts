import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import {
  GmailMessage,
  ParticipantWithMessageId,
} from 'src/modules/messaging/types/gmail-message';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageService } from 'src/modules/messaging/services/message/message.service';
import { MessageParticipantService } from 'src/modules/messaging/services/message-participant/message-participant.service';
import {
  CreateCompanyAndContactJobData,
  CreateCompanyAndContactJob,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';

@Injectable()
export class SaveMessageAndEmitContactCreationEventService {
  private readonly logger = new Logger(
    SaveMessageAndEmitContactCreationEventService.name,
  );

  constructor(
    private readonly messageService: MessageService,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly messageParticipantService: MessageParticipantService,
    @InjectMessageQueue(MessageQueue.emailQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  public async saveMessagesAndEmitContactCreationEventWithinTransaction(
    messagesToSave: GmailMessage[],
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    workspaceId: string,
    gmailMessageChannel: ObjectRecord<MessageChannelObjectMetadata>,
    transactionManager: EntityManager,
  ) {
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
      const messageId = messageExternalIdsAndIdsMap.get(message.externalId);

      return messageId
        ? message.participants.map((participant) => ({
            ...participant,
            messageId,
            shouldCreateContact:
              gmailMessageChannel.isContactAutoCreationEnabled &&
              message.participants.find((p) => p.role === 'from')?.handle ===
                connectedAccount.handle,
          }))
        : [];
    });

    await this.messageParticipantService.saveMessageParticipants(
      participantsWithMessageId,
      workspaceId,
      transactionManager,
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
  }

  async saveMessagesAndEmitContactCreation(
    messagesToSave: GmailMessage[],
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    workspaceId: string,
    gmailMessageChannelId: string,
  ) {
    const { dataSource: workspaceDataSource } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    let startTime = Date.now();

    const messageExternalIdsAndIdsMap = await this.messageService.saveMessages(
      messagesToSave,
      workspaceDataSource,
      connectedAccount,
      gmailMessageChannelId,
      workspaceId,
    );

    let endTime = Date.now();

    this.logger.log(
      `Saving messages for workspace ${workspaceId} and account ${
        connectedAccount.id
      } in ${endTime - startTime}ms`,
    );

    const gmailMessageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccount.id,
        workspaceId,
      );

    if (!gmailMessageChannel) {
      this.logger.error(
        `No message channel found for connected account ${connectedAccount.id} in workspace ${workspaceId} in saveMessagesAndCreateContacts`,
      );

      return;
    }

    const participantsWithMessageId: (ParticipantWithMessageId & {
      shouldCreateContact: boolean;
    })[] = messagesToSave.flatMap((message) => {
      const messageId = messageExternalIdsAndIdsMap.get(message.externalId);

      return messageId
        ? message.participants.map((participant) => ({
            ...participant,
            messageId,
            shouldCreateContact:
              gmailMessageChannel.isContactAutoCreationEnabled &&
              message.participants.find((p) => p.role === 'from')?.handle ===
                connectedAccount.handle,
          }))
        : [];
    });

    startTime = Date.now();

    await this.tryToSaveMessageParticipantsOrDeleteMessagesIfError(
      participantsWithMessageId,
      gmailMessageChannel,
      workspaceId,
      connectedAccount,
    );

    endTime = Date.now();

    this.logger.log(
      `Saving message participants for workspace ${workspaceId} and account in ${
        connectedAccount.id
      } ${endTime - startTime}ms`,
    );
  }

  private async tryToSaveMessageParticipantsOrDeleteMessagesIfError(
    participantsWithMessageId: (ParticipantWithMessageId & {
      shouldCreateContact: boolean;
    })[],
    gmailMessageChannel: ObjectRecord<MessageChannelObjectMetadata>,
    workspaceId: string,
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
  ) {
    try {
      await this.messageParticipantService.saveMessageParticipants(
        participantsWithMessageId,
        workspaceId,
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
      this.logger.error(
        `Error saving message participants for workspace ${workspaceId} and account ${connectedAccount.id}`,
        error,
      );

      const messagesToDelete = participantsWithMessageId.map(
        (participant) => participant.messageId,
      );

      await this.messageService.deleteMessages(
        messagesToDelete,
        gmailMessageChannel.id,
        workspaceId,
      );
    }
  }
}
