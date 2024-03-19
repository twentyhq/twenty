import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import compact from 'lodash/compact';

import { getDomainNameFromHandle } from 'src/modules/messaging/utils/get-domain-name-from-handle.util';
import { CreateCompanyService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company/create-company.service';
import { CreateContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { isWorkEmail } from 'src/utils/is-work-email';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { filterOutContactsFromCompanyOrWorkspace } from 'src/modules/connected-account/auto-companies-and-contacts-creation/utils/filter-out-contacts-from-company-or-workspace.util';
import { getUniqueContactsAndHandles } from 'src/modules/connected-account/auto-companies-and-contacts-creation/utils/get-unique-contacts-and-handles.util';
import { Contacts } from 'src/modules/connected-account/auto-companies-and-contacts-creation/types/contact.type';
import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant.repository';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { MessageParticipantService } from 'src/modules/messaging/services/message-participant/message-participant.service';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';

@Injectable()
export class CreateCompanyAndContactService {
  constructor(
    private readonly createContactService: CreateContactService,
    private readonly createCompaniesService: CreateCompanyService,
    @InjectObjectMetadataRepository(PersonObjectMetadata)
    private readonly personRepository: PersonRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberObjectMetadata)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    @InjectObjectMetadataRepository(MessageParticipantObjectMetadata)
    private readonly messageParticipantRepository: MessageParticipantRepository,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly messageParticipantService: MessageParticipantService,
  ) {}

  async createCompaniesAndContacts(
    selfHandle: string,
    contactsToCreate: Contacts,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    if (!contactsToCreate || contactsToCreate.length === 0) {
      return;
    }

    // TODO: This is a feature that may be implemented in the future
    const isContactAutoCreationForNonWorkEmailsEnabled = false;

    const workspaceMembers =
      await this.workspaceMemberRepository.getAllByWorkspaceId(
        workspaceId,
        transactionManager,
      );

    const contactsToCreateFromOtherCompanies =
      filterOutContactsFromCompanyOrWorkspace(
        contactsToCreate,
        selfHandle,
        workspaceMembers,
      );

    const { uniqueContacts, uniqueHandles } = getUniqueContactsAndHandles(
      contactsToCreateFromOtherCompanies,
    );

    if (uniqueHandles.length === 0) {
      return;
    }

    const alreadyCreatedContacts = await this.personRepository.getByEmails(
      uniqueHandles,
      workspaceId,
    );

    const alreadyCreatedContactEmails: string[] = alreadyCreatedContacts?.map(
      ({ email }) => email,
    );

    const filteredContactsToCreate = uniqueContacts.filter(
      (participant) =>
        !alreadyCreatedContactEmails.includes(participant.handle) &&
        participant.handle.includes('@') &&
        (isContactAutoCreationForNonWorkEmailsEnabled ||
          isWorkEmail(participant.handle)),
    );

    const filteredContactsToCreateWithCompanyDomainNames =
      filteredContactsToCreate?.map((participant) => ({
        handle: participant.handle,
        displayName: participant.displayName,
        companyDomainName: isWorkEmail(participant.handle)
          ? getDomainNameFromHandle(participant.handle)
          : undefined,
      }));

    const domainNamesToCreate = compact(
      filteredContactsToCreateWithCompanyDomainNames.map(
        (participant) => participant.companyDomainName,
      ),
    );

    const companiesObject = await this.createCompaniesService.createCompanies(
      domainNamesToCreate,
      workspaceId,
      transactionManager,
    );

    const formattedContactsToCreate =
      filteredContactsToCreateWithCompanyDomainNames.map((participant) => ({
        handle: participant.handle,
        displayName: participant.displayName,
        companyId:
          participant.companyDomainName &&
          companiesObject[participant.companyDomainName],
      }));

    await this.createContactService.createContacts(
      formattedContactsToCreate,
      workspaceId,
      transactionManager,
    );
  }

  async createCompaniesAndContactsAndUpdateContactsToCreate(
    selfHandle: string,
    contactsToCreate: Contacts,
    workspaceId: string,
  ) {
    const { dataSource: workspaceDataSource } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    await workspaceDataSource?.transaction(
      async (transactionManager: EntityManager) => {
        await this.createCompaniesAndContacts(
          selfHandle,
          contactsToCreate,
          workspaceId,
          transactionManager,
        );
      },
    );

    const handles = contactsToCreate.map((participant) => participant.handle);

    const messageContactsToCreateWithoutPersonIdAndWorkspaceMemberId =
      await this.messageParticipantRepository.getByHandlesWithoutPersonIdAndWorkspaceMemberId(
        handles,
        workspaceId,
      );

    await this.messageParticipantService.updateMessageParticipantsAfterPeopleCreation(
      messageContactsToCreateWithoutPersonIdAndWorkspaceMemberId,
      workspaceId,
    );
  }
}
