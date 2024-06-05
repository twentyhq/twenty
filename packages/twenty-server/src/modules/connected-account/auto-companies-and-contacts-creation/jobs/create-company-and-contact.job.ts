import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { CreateCompanyAndContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/services/create-company-and-contact.service';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

export type CreateCompanyAndContactJobData = {
  workspaceId: string;
  connectedAccountHandle: string;
  contactsToCreate: {
    displayName: string;
    handle: string;
  }[];
};

// TODO: Was used on two queues previously, is it working ?
@Processor(MessageQueue.messagingQueue)
@Processor(MessageQueue.emailQueue)
export class CreateCompanyAndContactJob {
  constructor(
    private readonly createCompanyAndContactService: CreateCompanyAndContactService,
  ) {}

  @Process()
  async handle(data: CreateCompanyAndContactJobData): Promise<void> {
    const { workspaceId, connectedAccountHandle, contactsToCreate } = data;

    await this.createCompanyAndContactService.createCompaniesAndContactsAndUpdateParticipants(
      connectedAccountHandle,
      contactsToCreate.map((contact) => ({
        handle: contact.handle,
        displayName: contact.displayName,
      })),
      workspaceId,
    );
  }
}
