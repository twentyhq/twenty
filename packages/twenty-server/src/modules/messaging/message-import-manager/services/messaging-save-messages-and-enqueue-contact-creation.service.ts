import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
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
  ) {}

  async saveMessagesAndEnqueueContactCreationJob(
    messagesToSave: MessageWithParticipants[],
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    const handleAliases = connectedAccount.handleAliases?.split(',') || [];

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    const participantsWithMessageId = await workspaceDataSource?.transaction(
      async (transactionManager: EntityManager) => {
        const messageExternalIdsAndIdsMap =
          await this.messageService.saveMessagesWithinTransaction(
            messagesToSave,
            messageChannel.id,
            transactionManager,
          );

        const participantsWithMessageId: (ParticipantWithMessageId & {
          shouldCreateContact: boolean;
        })[] = messagesToSave.flatMap((message) => {
          const messageId = messageExternalIdsAndIdsMap.get(message.externalId);

          return messageId
            ? message.participants.map((participant: Participant) => {
                const fromHandle =
                  message.participants.find((p) => p.role === 'from')?.handle ||
                  '';

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

        return participantsWithMessageId;
      },
    );

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
