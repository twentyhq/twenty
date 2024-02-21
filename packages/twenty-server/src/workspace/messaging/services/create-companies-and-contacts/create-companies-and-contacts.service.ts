import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { Participant } from 'src/workspace/messaging/types/gmail-message';
import { getDomainNameFromHandle } from 'src/workspace/messaging/utils/get-domain-name-from-handle.util';
import { CreateCompanyService } from 'src/workspace/messaging/services/create-company/create-company.service';
import { CreateContactService } from 'src/workspace/messaging/services/create-contact/create-contact.service';
import { PersonService } from 'src/workspace/messaging/repositories/person/person.service';
import { WorkspaceMemberService } from 'src/workspace/messaging/repositories/workspace-member/workspace-member.service';
import { getUniqueParticipantsAndHandles } from 'src/workspace/messaging/utils/get-unique-participants-and-handles.util';
import { filterOutParticipantsFromCompanyOrWorkspace } from 'src/workspace/messaging/utils/filter-out-participants-from-company-or-workspace.util';

@Injectable()
export class CreateCompaniesAndContactsService {
  constructor(
    private readonly personService: PersonService,
    private readonly createContactService: CreateContactService,
    private readonly createCompaniesService: CreateCompanyService,
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  async createCompaniesAndContacts(
    selfHandle: string,
    participants: Participant[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    if (participants.length === 0) {
      return;
    }

    const workspaceMembers =
      await this.workspaceMemberService.getAllByWorkspaceId(
        workspaceId,
        transactionManager,
      );

    // TODO: use isWorkEmail so we can create a contact even if the email is a personal email ex: @gmail.com
    const participantsFromOtherCompanies =
      filterOutParticipantsFromCompanyOrWorkspace(
        participants,
        selfHandle,
        workspaceMembers,
      );

    const { uniqueParticipants, uniqueHandles } =
      getUniqueParticipantsAndHandles(participantsFromOtherCompanies);

    const alreadyCreatedContacts = await this.personService.getByEmails(
      uniqueHandles,
      workspaceId,
    );

    const alreadyCreatedContactEmails: string[] = alreadyCreatedContacts?.map(
      ({ email }) => email,
    );

    const filteredParticipants = uniqueParticipants.filter(
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
