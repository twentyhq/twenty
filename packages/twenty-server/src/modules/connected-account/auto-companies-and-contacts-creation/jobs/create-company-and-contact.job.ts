import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { CreateCompanyAndContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/services/create-company-and-contact.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type CreateCompanyAndContactJobData = {
  workspaceId: string;
  connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>;
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

    await this.createCompanyAndContactService.createCompaniesAndContactsAndUpdateParticipants(
      connectedAccount,
      contactsToCreate.map((contact) => ({
        handle: contact.handle,
        displayName: contact.displayName,
      })),
      workspaceId,
    );
  }
}
