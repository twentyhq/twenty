import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { CreateCompaniesAndContactsService } from 'src/workspace/messaging/create-companies-and-contacts/create-companies-and-contacts.service';
import { MessageChannelService } from 'src/workspace/messaging/message-channel/message-channel.service';

export type CreateContactsAndCompaniesAfterSyncJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Injectable()
export class CreateContactsAndCompaniesAfterSyncJob
  implements MessageQueueJob<CreateContactsAndCompaniesAfterSyncJobData>
{
  constructor(
    private readonly createCompaniesAndContactsService: CreateCompaniesAndContactsService,
    private readonly messageChannelService: MessageChannelService,
  ) {}

  async handle(
    data: CreateContactsAndCompaniesAfterSyncJobData,
  ): Promise<void> {
    const { workspaceId, messageChannelId } = data;

    const isContactAutoCreationEnabled =
      await this.messageChannelService.getIsContactAutoCreationEnabledByMessageChannelId(
        messageChannelId,
        workspaceId,
      );

    if (!isContactAutoCreationEnabled) {
      return;
    }

    await this.createCompaniesAndContactsService.createCompaniesAndContacts(
      message.participants,
      workspaceId,
      manager,
    );
  }
}
