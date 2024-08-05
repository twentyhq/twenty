import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CreateCompanyAndContactService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessageParticipantRepository } from 'src/modules/messaging/common/repositories/message-participant.repository';
import {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export type MessagingCreateCompanyAndContactAfterSyncJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor(MessageQueue.messagingQueue)
export class MessagingCreateCompanyAndContactAfterSyncJob {
  private readonly logger = new Logger(
    MessagingCreateCompanyAndContactAfterSyncJob.name,
  );
  constructor(
    private readonly createCompanyAndContactService: CreateCompanyAndContactService,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelService: MessageChannelRepository,
    @InjectObjectMetadataRepository(MessageParticipantWorkspaceEntity)
    private readonly messageParticipantRepository: MessageParticipantRepository,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
  ) {}

  @Process(MessagingCreateCompanyAndContactAfterSyncJob.name)
  async handle(
    data: MessagingCreateCompanyAndContactAfterSyncJobData,
  ): Promise<void> {
    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and messageChannel ${data.messageChannelId}`,
    );
    const { workspaceId, messageChannelId } = data;

    const messageChannel = await this.messageChannelService.getByIds(
      [messageChannelId],
      workspaceId,
    );

    const { contactAutoCreationPolicy, connectedAccountId } = messageChannel[0];

    if (
      contactAutoCreationPolicy === MessageChannelContactAutoCreationPolicy.NONE
    ) {
      return;
    }

    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      throw new Error(
        `Connected account with id ${connectedAccountId} not found in workspace ${workspaceId}`,
      );
    }

    const contactsToCreate =
      contactAutoCreationPolicy ===
      MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED
        ? await this.messageParticipantRepository.getByMessageChannelIdWithoutPersonIdAndWorkspaceMemberId(
            messageChannelId,
            workspaceId,
          )
        : await this.messageParticipantRepository.getByMessageChannelIdWithoutPersonIdAndWorkspaceMemberIdAndMessageOutgoing(
            messageChannelId,
            workspaceId,
          );

    await this.createCompanyAndContactService.createCompaniesAndContactsAndUpdateParticipants(
      connectedAccount,
      contactsToCreate,
      workspaceId,
      FieldActorSource.EMAIL,
    );

    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and messageChannel ${data.messageChannelId} done`,
    );
  }
}
