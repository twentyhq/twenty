import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import compact from 'lodash.compact';
import { type DeepPartial } from 'typeorm';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CONTACTS_CREATION_BATCH_SIZE } from 'src/modules/contact-creation-manager/constants/contacts-creation-batch-size.constant';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreatePersonService } from 'src/modules/contact-creation-manager/services/create-person.service';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { filterOutSelfAndContactsFromCompanyOrWorkspace } from 'src/modules/contact-creation-manager/utils/filter-out-contacts-from-company-or-workspace.util';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { getUniqueContactsAndHandles } from 'src/modules/contact-creation-manager/utils/get-unique-contacts-and-handles.util';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { isWorkDomain, isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
export class CreateCompanyAndPersonService {
  constructor(
    private readonly createPersonService: CreatePersonService,
    private readonly createCompaniesService: CreateCompanyService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  private async createCompaniesAndPeople(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    contactsToCreate: Contact[],
    workspaceId: string,
    source: FieldActorSource,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (!contactsToCreate || contactsToCreate.length === 0) {
      return [];
    }

    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        PersonWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        WorkspaceMemberWorkspaceEntity,
      );

    const workspaceMembers = await workspaceMemberRepository.find();

    const peopleToCreateFromOtherCompanies =
      filterOutSelfAndContactsFromCompanyOrWorkspace(
        contactsToCreate,
        connectedAccount,
        workspaceMembers,
      );

    const { uniqueContacts, uniqueHandles } = getUniqueContactsAndHandles(
      peopleToCreateFromOtherCompanies,
    );

    if (uniqueHandles.length === 0) {
      return [];
    }

    const queryBuilder = addPersonEmailFiltersToQueryBuilder({
      queryBuilder: personRepository.createQueryBuilder('person'),
      emails: uniqueHandles,
    });

    const alreadyCreatedContacts = await queryBuilder
      .orderBy('person.createdAt', 'ASC')
      .getMany();

    const alreadyCreatedContactEmails: string[] =
      alreadyCreatedContacts?.reduce<string[]>((acc, { emails }) => {
        const currentContactEmails: string[] = [];

        if (isNonEmptyString(emails?.primaryEmail)) {
          currentContactEmails.push(emails.primaryEmail.toLowerCase());
        }
        if (Array.isArray(emails?.additionalEmails)) {
          const additionalEmails = emails.additionalEmails
            .filter(isNonEmptyString)
            .map((email) => email.toLowerCase());

          currentContactEmails.push(...additionalEmails);
        }

        return [...acc, ...currentContactEmails];
      }, []);

    const filteredContactsToCreate = uniqueContacts.filter(
      (participant) =>
        !alreadyCreatedContactEmails.includes(
          participant.handle.toLowerCase(),
        ) && participant.handle.includes('@'),
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
      filteredContactsToCreateWithCompanyDomainNames
        .filter((participant) => participant.companyDomainName)
        .map((participant) => ({
          domainName: participant.companyDomainName,
          createdBySource: source,
          createdByWorkspaceMember: connectedAccount.accountOwner,
        })),
    );

    const workDomainNamesToCreate = domainNamesToCreate.filter(
      (domainName) =>
        domainName?.domainName && isWorkDomain(domainName.domainName),
    );

    const workDomainNamesToCreateFormatted = workDomainNamesToCreate.map(
      (domainName) => ({
        ...domainName,
        createdBySource: source,
        createdByWorkspaceMember: connectedAccount.accountOwner,
        createdByContext: {
          provider: connectedAccount.provider,
        },
      }),
    );

    const companies =
      await this.createCompaniesService.createOrRestoreCompanies(
        workDomainNamesToCreateFormatted,
        workspaceId,
      );

    const formattedContactsToCreate =
      filteredContactsToCreateWithCompanyDomainNames.map((contact) => ({
        handle: contact.handle,
        displayName: contact.displayName,
        companyId: isNonEmptyString(contact.companyDomainName)
          ? companies[contact.companyDomainName]
          : undefined,
        createdBySource: source,
        createdByWorkspaceMember: connectedAccount.accountOwner,
        createdByContext: {
          provider: connectedAccount.provider,
        },
      }));

    const createdOrRestoredPeople =
      await this.createPersonService.createOrRestorePeople(
        formattedContactsToCreate,
        workspaceId,
      );

    return createdOrRestoredPeople;
  }

  async createCompaniesAndPeopleAndUpdateParticipants(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    contactsToCreate: Contact[],
    workspaceId: string,
    source: FieldActorSource,
  ) {
    const peopleBatches = chunk(contactsToCreate, CONTACTS_CREATION_BATCH_SIZE);

    if (!connectedAccount.accountOwner) {
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          WorkspaceMemberWorkspaceEntity,
        );

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: {
          id: connectedAccount.accountOwnerId,
        },
      });

      if (!workspaceMember) {
        throw new Error(
          `Workspace member with id ${connectedAccount.accountOwnerId} not found in workspace ${workspaceId}`,
        );
      }

      connectedAccount.accountOwner = workspaceMember;
    }

    for (const peopleBatch of peopleBatches) {
      try {
        await this.createCompaniesAndPeople(
          connectedAccount,
          peopleBatch,
          workspaceId,
          source,
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspaceId,
          },
        });
      }
    }
  }
}
