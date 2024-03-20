import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { CreateCompanyAndContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company-and-contact/create-company-and-contact.service';

export type CreateCompanyAndContactJobData = {
  workspaceId: string;
  connectedAccount: {
    handle: string;
  };
  contactsToCreate: {
    displayName: string;
    handle: string;
  }[];
};

@Injectable()
export class CreateCompanyAndContactJob
  implements MessageQueueJob<CreateCompanyAndContactJobData>
{
  constructor(
    private readonly createCompanyAndContactService: CreateCompanyAndContactService,
  ) {}

  async handle(data: CreateCompanyAndContactJobData): Promise<void> {
    const { workspaceId, connectedAccount, contactsToCreate } = data;

    this.createCompanyAndContactService.createCompaniesAndContactsAndUpdateParticipants(
      connectedAccount,
      contactsToCreate.map((contact) => ({
        handle: contact.handle,
        displayName: contact.displayName,
      })),
      workspaceId,
    );
  }
}
