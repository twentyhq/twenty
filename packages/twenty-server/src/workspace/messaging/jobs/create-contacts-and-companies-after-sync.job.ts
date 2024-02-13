import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { CreateCompanyService } from 'src/workspace/messaging/create-company/create-company.service';
import { CreateContactService } from 'src/workspace/messaging/create-contact/create-contact.service';
import { MessageParticipantService } from 'src/workspace/messaging/message-participant/message-participant.service';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';

export type CreateContactsAndCompaniesAfterSyncJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Injectable()
export class CreateContactsAndCompaniesAfterSyncJob
  implements MessageQueueJob<CreateContactsAndCompaniesAfterSyncJobData>
{
  constructor(
    private readonly messageParticipantService: MessageParticipantService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly createCompaniesService: CreateCompanyService,
    private readonly createContactService: CreateContactService,
  ) {}

  async handle(
    data: CreateContactsAndCompaniesAfterSyncJobData,
  ): Promise<void> {
    const { workspaceId, messageChannelId } = data;

    const messageParticipantsWithoutPersonIdAndWorkspaceMemberId =
      await this.messageParticipantService.getByMessageChannelIdWithoutPersonIdAndWorkspaceMemberId(
        messageChannelId,
        workspaceId,
      );

    if (messageParticipantsWithoutPersonIdAndWorkspaceMemberId.length === 0) {
      return;
    }

    const dataSourceMetadata =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const manager = dataSourceMetadata.manager;

    const companiesObject = await this.createCompaniesService.createCompanies(
      domainNamesToCreate,
      dataSourceMetadata,
      manager,
    );

    const contactsToCreate = filteredParticipantsWihCompanyDomainNames.map(
      (participant) => ({
        handle: participant.handle,
        displayName: participant.displayName,
        companyId: companiesObject[participant.companyDomainName],
      }),
    );

    const personIds = await this.createContactService.createContacts(
      contactsToCreate,
      dataSourceMetadata,
      manager,
    );

    await this.messageParticipantService.updateParticipantsPersonIds(
      messageParticipantsWithoutPersonIdAndWorkspaceMemberId.map(
        (participant) => participant.id,
      ),
      personIds,
      workspaceId,
      manager,
    );
  }
}
