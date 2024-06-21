import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { EntityManager } from 'typeorm';
import compact from 'lodash.compact';

import { getDomainNameFromHandle } from 'src/modules/calendar-messaging-participant/utils/get-domain-name-from-handle.util';
import { CreateCompanyService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company/create-company.service';
import { CreateContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { isWorkEmail } from 'src/utils/is-work-email';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { getUniqueContactsAndHandles } from 'src/modules/connected-account/auto-companies-and-contacts-creation/utils/get-unique-contacts-and-handles.util';
import { Contacts } from 'src/modules/connected-account/auto-companies-and-contacts-creation/types/contact.type';
import { CalendarEventParticipantService } from 'src/modules/calendar/services/calendar-event-participant/calendar-event-participant.service';
import { filterOutContactsFromCompanyOrWorkspace } from 'src/modules/connected-account/auto-companies-and-contacts-creation/utils/filter-out-contacts-from-company-or-workspace.util';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { MessagingMessageParticipantService } from 'src/modules/messaging/common/services/messaging-message-participant.service';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event-participant.workspace-entity';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CreateCompanyAndContactService {
  constructor(
    private readonly createContactService: CreateContactService,
    private readonly createCompaniesService: CreateCompanyService,
    @InjectObjectMetadataRepository(PersonWorkspaceEntity)
    private readonly personRepository: PersonRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    @InjectWorkspaceDatasource()
    private readonly workspaceDataSource: WorkspaceDataSource,
    private readonly messageParticipantService: MessagingMessageParticipantService,
    private readonly calendarEventParticipantService: CalendarEventParticipantService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createCompaniesAndPeople(
    connectedAccountHandle: string,
    contactsToCreate: Contacts,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<PersonWorkspaceEntity>[]> {
    if (!contactsToCreate || contactsToCreate.length === 0) {
      return [];
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
        connectedAccountHandle,
        workspaceMembers,
      );

    const { uniqueContacts, uniqueHandles } = getUniqueContactsAndHandles(
      contactsToCreateFromOtherCompanies,
    );

    if (uniqueHandles.length === 0) {
      return [];
    }

    const alreadyCreatedContacts = await this.personRepository.getByEmails(
      uniqueHandles,
      workspaceId,
      transactionManager,
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
      filteredContactsToCreateWithCompanyDomainNames.map((contact) => ({
        handle: contact.handle,
        displayName: contact.displayName,
        companyId:
          contact.companyDomainName && contact.companyDomainName !== ''
            ? companiesObject[contact.companyDomainName]
            : undefined,
      }));

    return await this.createContactService.createPeople(
      formattedContactsToCreate,
      workspaceId,
      transactionManager,
    );
  }

  async createCompaniesAndContactsAndUpdateParticipants(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    contactsToCreate: Contacts,
    workspaceId: string,
  ) {
    let updatedMessageParticipants: ObjectRecord<MessageParticipantWorkspaceEntity>[] =
      [];
    let updatedCalendarEventParticipants: ObjectRecord<CalendarEventParticipantWorkspaceEntity>[] =
      [];

    await this.workspaceDataSource?.transaction(
      async (transactionManager: EntityManager) => {
        const createdPeople = await this.createCompaniesAndPeople(
          connectedAccount.handle,
          contactsToCreate,
          workspaceId,
          transactionManager,
        );

        updatedMessageParticipants =
          await this.messageParticipantService.updateMessageParticipantsAfterPeopleCreation(
            createdPeople,
            workspaceId,
            transactionManager,
          );

        updatedCalendarEventParticipants =
          await this.calendarEventParticipantService.updateCalendarEventParticipantsAfterPeopleCreation(
            createdPeople,
            workspaceId,
            transactionManager,
          );
      },
    );

    this.eventEmitter.emit(`messageParticipant.matched`, {
      workspaceId,
      workspaceMemberId: connectedAccount.accountOwnerId,
      messageParticipants: updatedMessageParticipants,
    });

    this.eventEmitter.emit(`calendarEventParticipant.matched`, {
      workspaceId,
      workspaceMemberId: connectedAccount.accountOwnerId,
      calendarEventParticipants: updatedCalendarEventParticipants,
    });
  }
}
