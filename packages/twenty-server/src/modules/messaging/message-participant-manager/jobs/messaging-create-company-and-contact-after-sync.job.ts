import { Logger } from '@nestjs/common';

import { Any, IsNull } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CreateCompanyAndContactService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
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
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  @Process(MessagingCreateCompanyAndContactAfterSyncJob.name)
  async handle(
    data: MessagingCreateCompanyAndContactAfterSyncJobData,
  ): Promise<void> {
    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and messageChannel ${data.messageChannelId}`,
    );
    const { workspaceId, messageChannelId } = data;

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOneOrFail({
      where: {
        id: messageChannelId,
      },
    });

    const { contactAutoCreationPolicy, connectedAccountId } = messageChannel;

    if (
      contactAutoCreationPolicy === MessageChannelContactAutoCreationPolicy.NONE
    ) {
      return;
    }

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: {
        id: connectedAccountId,
      },
    });

    if (!connectedAccount) {
      throw new Error(
        `Connected account with id ${connectedAccountId} not found in workspace ${workspaceId}`,
      );
    }

    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const directionFilter =
      contactAutoCreationPolicy ===
      MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED
        ? Any([MessageDirection.INCOMING, MessageDirection.OUTGOING])
        : MessageDirection.OUTGOING;

    const contactsToCreate = await messageParticipantRepository.find({
      where: {
        message: {
          messageChannelMessageAssociations: {
            messageChannelId,
            direction: directionFilter,
          },
        },
        personId: IsNull(),
        workspaceMemberId: IsNull(),
      },
    });

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
