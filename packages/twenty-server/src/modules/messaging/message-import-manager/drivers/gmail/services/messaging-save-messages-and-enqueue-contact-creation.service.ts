import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  CreateCompanyAndContactJob,
  CreateCompanyAndContactJobData,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessagingMessageService } from 'src/modules/messaging/common/services/messaging-message.service';
import {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import {
  GmailMessage,
  Participant,
  ParticipantWithMessageId,
} from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';
import { isGroupEmail } from 'src/utils/is-group-email';
import { isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
export class MessagingSaveMessagesAndEnqueueContactCreationService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly messageService: MessagingMessageService,
    private readonly messageParticipantService: MessagingMessageParticipantService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async saveMessagesAndEnqueueContactCreationJob(
    messagesToSave: GmailMessage[],
    messageChannel: MessageChannelWorkspaceEntity,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const emailAliases = connectedAccount.emailAliases?.split(',') || [];

    let savedMessageParticipants: MessageParticipantWorkspaceEntity[] = [];

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
            ? message.participants.map((participant: Participant) => {
                const fromHandle =
                  message.participants.find((p) => p.role === 'from')?.handle ||
                  '';

                const isMessageSentByConnectedAccount =
                  emailAliases.includes(fromHandle);

                const isParticipantConnectedAccount =
                  emailAliases.includes(participant.handle) ||
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

        savedMessageParticipants =
          await this.messageParticipantService.saveMessageParticipants(
            participantsWithMessageId,
            workspaceId,
            transactionManager,
          );

        return participantsWithMessageId;
      },
    );

    this.eventEmitter.emit(`messageParticipant.matched`, {
      workspaceId,
      workspaceMemberId: connectedAccount.accountOwnerId,
      messageParticipants: savedMessageParticipants,
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
        },
      );
    }
  }
}
