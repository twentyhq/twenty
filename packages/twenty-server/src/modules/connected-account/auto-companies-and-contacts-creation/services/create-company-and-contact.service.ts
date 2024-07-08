import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import chunk from 'lodash.chunk';
import compact from 'lodash.compact';
import { EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { InjectWorkspaceDatasource } from 'src/engine/twenty-orm/decorators/inject-workspace-datasource.decorator';
import { getDomainNameFromHandle } from 'src/modules/calendar-messaging-participant/utils/get-domain-name-from-handle.util';
import { CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CONTACTS_CREATION_BATCH_SIZE } from 'src/modules/connected-account/auto-companies-and-contacts-creation/constants/contacts-creation-batch-size.constant';
import { CreateCompanyService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-company/create-company.service';
import { CreateContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/create-contact/create-contact.service';
import { Contact } from 'src/modules/connected-account/auto-companies-and-contacts-creation/types/contact.type';
import { filterOutSelfAndContactsFromCompanyOrWorkspace } from 'src/modules/connected-account/auto-companies-and-contacts-creation/utils/filter-out-contacts-from-company-or-workspace.util';
import { getUniqueContactsAndHandles } from 'src/modules/connected-account/auto-companies-and-contacts-creation/utils/get-unique-contacts-and-handles.util';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessagingMessageParticipantService } from 'src/modules/messaging/common/services/messaging-message-participant.service';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { isWorkEmail } from 'src/utils/is-work-email';

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
    connectedAccount: ConnectedAccountWorkspaceEntity,
    contactsToCreate: Contact[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PersonWorkspaceEntity[]> {
    if (!contactsToCreate || contactsToCreate.length === 0) {
      return [];
    }

    const workspaceMembers =
      await this.workspaceMemberRepository.getAllByWorkspaceId(
        workspaceId,
        transactionManager,
      );

    const contactsToCreateFromOtherCompanies =
      filterOutSelfAndContactsFromCompanyOrWorkspace(
        contactsToCreate,
        connectedAccount,
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
        participant.handle.includes('@'),
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
    contactsToCreate: Contact[],
    workspaceId: string,
  ) {
    const contactsBatches = chunk(
      contactsToCreate,
      CONTACTS_CREATION_BATCH_SIZE,
    );

    for (const contactsBatch of contactsBatches) {
      let updatedMessageParticipants: MessageParticipantWorkspaceEntity[] = [];
      let updatedCalendarEventParticipants: CalendarEventParticipantWorkspaceEntity[] =
        [];

      await this.workspaceDataSource?.transaction(
        async (transactionManager: EntityManager) => {
          const createdPeople = await this.createCompaniesAndPeople(
            connectedAccount,
            contactsBatch,
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
}
