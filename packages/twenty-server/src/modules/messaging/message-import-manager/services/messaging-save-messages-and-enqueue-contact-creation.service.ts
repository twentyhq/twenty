import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  CreateCompanyAndContactJob,
  CreateCompanyAndContactJobData,
} from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';
import {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  Participant,
  ParticipantWithMessageId,
} from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';
import { MessagingMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-message.service';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';
import { isGroupEmail } from 'src/utils/is-group-email';
import { isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
export class MessagingSaveMessagesAndEnqueueContactCreationService {
  constructor(
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly messageService: MessagingMessageService,
    private readonly messageParticipantService: MessagingMessageParticipantService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async saveMessagesAndEnqueueContactCreation(
    messagesToSave: MessageWithParticipants[],
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    const handleAliases = connectedAccount.handleAliases?.split(',') || [];

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    const createdMessagesWithParticipants =
      await workspaceDataSource?.transaction(
        async (transactionManager: WorkspaceEntityManager) => {
          const { messageExternalIdsAndIdsMap, createdMessages } =
            await this.messageService.saveMessagesWithinTransaction(
              messagesToSave,
              messageChannel.id,
              transactionManager,
            );

          const participantsWithMessageId: (ParticipantWithMessageId & {
            shouldCreateContact: boolean;
          })[] = messagesToSave.flatMap((message) => {
            const messageId = messageExternalIdsAndIdsMap.get(
              message.externalId,
            );

            return messageId
              ? message.participants.map((participant: Participant) => {
                  const fromHandle =
                    message.participants.find((p) => p.role === 'from')
                      ?.handle || '';

                  const isMessageSentByConnectedAccount =
                    handleAliases.includes(fromHandle) ||
                    fromHandle === connectedAccount.handle;

                  const isParticipantConnectedAccount =
                    handleAliases.includes(participant.handle) ||
                    participant.handle === connectedAccount.handle;

                  const isExcludedByNonProfessionalEmails =
                    messageChannel.excludeNonProfessionalEmails &&
                    !isWorkEmail(participant.handle);

                  const isExcludedByGroupEmails =
                    messageChannel.excludeGroupEmails &&
                    isGroupEmail(participant.handle);

                  const shouldCreateContact =
                    !!participant.handle &&
                    !isParticipantConnectedAccount &&
                    !isExcludedByNonProfessionalEmails &&
                    !isExcludedByGroupEmails &&
                    (messageChannel.contactAutoCreationPolicy ===
                      MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED ||
                      (messageChannel.contactAutoCreationPolicy ===
                        MessageChannelContactAutoCreationPolicy.SENT &&
                        isMessageSentByConnectedAccount));

                  return {
                    ...participant,
                    messageId,
                    shouldCreateContact,
                  };
                })
              : [];
          });

          await this.messageParticipantService.saveMessageParticipants(
            participantsWithMessageId,
            transactionManager,
          );

          return { participantsWithMessageId, createdMessages };
        },
      );

    const { participantsWithMessageId, createdMessages } =
      createdMessagesWithParticipants;

    const messageMetadata = await this.objectMetadataRepository.findOneOrFail({
      where: { nameSingular: 'message', workspaceId },
    });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'message',
      action: DatabaseEventAction.CREATED,
      events: createdMessages.map((message) => {
        return {
          recordId: message.id ?? '',
          objectMetadata: messageMetadata,
          properties: {
            after: message,
          },
        };
      }),
      workspaceId,
    });

    if (messageChannel.isContactAutoCreationEnabled) {
      const contactsToCreate = participantsWithMessageId.filter(
        (participant) => participant.shouldCreateContact,
      );

      await this.messageQueueService.add<CreateCompanyAndContactJobData>(
        CreateCompanyAndContactJob.name,
        {
          workspaceId,
          connectedAccount,
          contactsToCreate,
          source: FieldActorSource.EMAIL,
        },
      );
    }
  }
}
