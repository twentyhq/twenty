import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { Participant } from 'src/workspace/messaging/types/gmail-message';
import { getDomainNameFromHandle } from 'src/workspace/messaging/utils/get-domain-name-from-handle.util';
import { CreateCompanyService } from 'src/workspace/messaging/services/create-company/create-company.service';
import { CreateContactService } from 'src/workspace/messaging/services/create-contact/create-contact.service';

@Injectable()
export class CreateCompaniesAndContactsService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly createContactService: CreateContactService,
    private readonly createCompaniesService: CreateCompanyService,
  ) {}

  async createCompaniesAndContacts(
    participants: Participant[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const alreadyCreatedContacts =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT email FROM ${dataSourceSchema}."person" WHERE "email" = ANY($1)`,
        [participants.map((participant) => participant.handle)],
        workspaceId,
        transactionManager,
      );

    const alreadyCreatedContactEmails: string[] = alreadyCreatedContacts?.map(
      ({ email }) => email,
    );

    const filteredParticipants = participants.filter(
      (participant) =>
        !alreadyCreatedContactEmails.includes(participant.handle) &&
        participant.handle.includes('@'),
    );

    const filteredParticipantsWithCompanyDomainNames =
      filteredParticipants?.map((participant) => ({
        handle: participant.handle,
        displayName: participant.displayName,
        companyDomainName: getDomainNameFromHandle(participant.handle),
      }));

    const domainNamesToCreate = filteredParticipantsWithCompanyDomainNames.map(
      (participant) => participant.companyDomainName,
    );

    const companiesObject = await this.createCompaniesService.createCompanies(
      domainNamesToCreate,
      workspaceId,
      transactionManager,
    );

    const contactsToCreate = filteredParticipantsWithCompanyDomainNames.map(
      (participant) => ({
        handle: participant.handle,
        displayName: participant.displayName,
        companyId: companiesObject[participant.companyDomainName],
      }),
    );

    await this.createContactService.createContacts(
      contactsToCreate,
      workspaceId,
      transactionManager,
    );
  }
}
