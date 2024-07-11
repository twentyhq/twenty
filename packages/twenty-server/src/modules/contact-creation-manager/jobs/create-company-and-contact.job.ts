import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CreateCompanyAndContactService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';

export type CreateCompanyAndContactJobData = {
  workspaceId: string;
  connectedAccount: ConnectedAccountWorkspaceEntity;
  contactsToCreate: {
    displayName: string;
    handle: string;
  }[];
};

@Processor(MessageQueue.contactCreationQueue)
export class CreateCompanyAndContactJob {
  constructor(
    private readonly createCompanyAndContactService: CreateCompanyAndContactService,
  ) {}

  @Process(CreateCompanyAndContactJob.name)
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
