import { type FieldActorSource } from 'twenty-shared/types';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CreateCompanyAndPersonService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';

export type CreateCompanyAndContactJobData = {
  workspaceId: string;
  connectedAccount: ConnectedAccountWorkspaceEntity;
  contactsToCreate: {
    displayName: string;
    handle: string;
  }[];
  source: FieldActorSource;
};

@Processor(MessageQueue.contactCreationQueue)
export class CreateCompanyAndContactJob {
  constructor(
    private readonly createCompanyAndPersonService: CreateCompanyAndPersonService,
  ) {}

  @Process(CreateCompanyAndContactJob.name)
  async handle(data: CreateCompanyAndContactJobData): Promise<void> {
    const { workspaceId, connectedAccount, contactsToCreate, source } = data;

    await this.createCompanyAndPersonService.createCompaniesAndPeopleAndUpdateParticipants(
      connectedAccount,
      contactsToCreate.map((contact) => ({
        handle: contact.handle,
        displayName: contact.displayName,
      })),
      workspaceId,
      source,
    );
  }
}
