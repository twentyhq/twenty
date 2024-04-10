import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CreateCompanyAndContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/services/create-company-and-contact.service';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant.repository';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';

export type MessagingCreateCompaniesAndContactsAfterSyncJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Injectable()
export class MessagingCreateCompaniesAndContactsAfterSyncJob
  implements
    MessageQueueJob<MessagingCreateCompaniesAndContactsAfterSyncJobData>
{
  private readonly logger = new Logger(
    MessagingCreateCompaniesAndContactsAfterSyncJob.name,
  );
  constructor(
    private readonly createCompaniesAndContactsService: CreateCompanyAndContactService,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelService: MessageChannelRepository,
    @InjectObjectMetadataRepository(MessageParticipantObjectMetadata)
    private readonly messageParticipantRepository: MessageParticipantRepository,
  ) {}

  async handle(
    data: MessagingCreateCompaniesAndContactsAfterSyncJobData,
  ): Promise<void> {
    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and messageChannel ${data.messageChannelId}`,
    );
    const { workspaceId, messageChannelId } = data;

    const messageChannel = await this.messageChannelService.getByIds(
      [messageChannelId],
      workspaceId,
    );

    const { handle, isContactAutoCreationEnabled } = messageChannel[0];

    if (!isContactAutoCreationEnabled) {
      return;
    }

    const contactsToCreate =
      await this.messageParticipantRepository.getByMessageChannelIdWithoutPersonIdAndWorkspaceMemberIdAndMessageOutgoing(
        messageChannelId,
        workspaceId,
      );

    await this.createCompaniesAndContactsService.createCompaniesAndContactsAndUpdateParticipantsAfterSync(
      handle,
      contactsToCreate,
      workspaceId,
    );

    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and messageChannel ${data.messageChannelId} done`,
    );
  }
}
