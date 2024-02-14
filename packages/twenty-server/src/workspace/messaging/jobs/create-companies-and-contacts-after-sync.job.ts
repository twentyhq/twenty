import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { CreateCompaniesAndContactsService } from 'src/workspace/messaging/services/create-companies-and-contacts/create-companies-and-contacts.service';
import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';
import { MessageParticipantService } from 'src/workspace/messaging/repositories/message-participant/message-participant.service';

export type CreateCompaniesAndContactsAfterSyncJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Injectable()
export class CreateCompaniesAndContactsAfterSyncJob
  implements MessageQueueJob<CreateCompaniesAndContactsAfterSyncJobData>
{
  private readonly logger = new Logger(
    CreateCompaniesAndContactsAfterSyncJob.name,
  );
  constructor(
    private readonly createCompaniesAndContactsService: CreateCompaniesAndContactsService,
    private readonly messageChannelService: MessageChannelService,
    private readonly messageParticipantService: MessageParticipantService,
  ) {}

  async handle(
    data: CreateCompaniesAndContactsAfterSyncJobData,
  ): Promise<void> {
    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and messageChannel ${data.messageChannelId}`,
    );
    const { workspaceId, messageChannelId } = data;

    const isContactAutoCreationEnabled =
      await this.messageChannelService.getIsContactAutoCreationEnabledByMessageChannelId(
        messageChannelId,
        workspaceId,
      );

    if (!isContactAutoCreationEnabled) {
      return;
    }

    const messageParticipantsWithoutPersonIdAndWorkspaceMemberId =
      await this.messageParticipantService.getByMessageChannelIdWithoutPersonIdAndWorkspaceMemberId(
        messageChannelId,
        workspaceId,
      );

    await this.createCompaniesAndContactsService.createCompaniesAndContacts(
      messageParticipantsWithoutPersonIdAndWorkspaceMemberId,
      workspaceId,
    );

    await this.messageParticipantService.updateMessageParticipantsAfterPeopleCreation(
      messageParticipantsWithoutPersonIdAndWorkspaceMemberId,
      workspaceId,
    );

    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and messageChannel ${data.messageChannelId} done`,
    );
  }
}
