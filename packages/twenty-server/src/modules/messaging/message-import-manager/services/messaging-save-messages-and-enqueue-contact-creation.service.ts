import { Injectable } from '@nestjs/common';

import { FieldActorSource, MessageParticipantRole } from 'twenty-shared/types';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  CreateCompanyAndContactJob,
  type CreateCompanyAndContactJobData,
} from 'src/modules/contact-creation-manager/jobs/create-company-and-contact.job';
import {
  MessageChannelContactAutoCreationPolicy,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  type Participant,
  type ParticipantWithMessageId,
} from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';
import { MessagingMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-message.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';
import { isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
export class MessagingSaveMessagesAndEnqueueContactCreationService {
  constructor(
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly messageService: MessagingMessageService,
    private readonly messageParticipantService: MessagingMessageParticipantService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async saveMessagesAndEnqueueContactCreation(
    messagesToSave: MessageWithParticipants[],
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    const handleAliases = connectedAccount.handleAliases?.split(',') || [];
    const authContext = buildSystemAuthContext(workspaceId);

    const participantsWithMessageId =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workspaceDataSource =
            await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

          return workspaceDataSource?.transaction(
            async (transactionManager: WorkspaceEntityManager) => {
              const { messageExternalIdsAndIdsMap } =
                await this.messageService.saveMessagesWithinTransaction(
                  messagesToSave,
                  messageChannel.id,
                  transactionManager,
                  workspaceId,
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
                        message.participants.find(
                          (p) => p.role === MessageParticipantRole.FROM,
                        )?.handle || '';

                      const isMessageSentByConnectedAccount =
                        handleAliases.includes(fromHandle) ||
                        fromHandle === connectedAccount.handle;

                      const isParticipantConnectedAccount =
                        handleAliases.includes(participant.handle) ||
                        participant.handle === connectedAccount.handle;

                      const isExcludedByNonProfessionalEmails =
                        messageChannel.excludeNonProfessionalEmails &&
                        !isWorkEmail(participant.handle);

                      const shouldCreateContact =
                        !!participant.handle &&
                        !isParticipantConnectedAccount &&
                        !isExcludedByNonProfessionalEmails &&
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
                workspaceId,
                transactionManager,
              );

              return participantsWithMessageId;
            },
          );
        },
      );

    if (
      messageChannel.isContactAutoCreationEnabled &&
      participantsWithMessageId
    ) {
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
