import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import compact from 'lodash.compact';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { type DeepPartial } from 'typeorm';
import { v4 } from 'uuid';

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
import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/modules/contact-creation-manager/utils/get-first-name-and-last-name-from-handle-and-display-name.util';
import { getUniqueContactsAndHandles } from 'src/modules/contact-creation-manager/utils/get-unique-contacts-and-handles.util';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { computeDisplayName } from 'src/utils/compute-display-name';
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

    const alreadyCreatedPeople = await queryBuilder
      .orderBy('person.createdAt', 'ASC')
      .withDeleted()
      .getMany();

    const shouldCreateOrRestorePeopleByHandleMap = new Map<
      string,
      { existingPerson: PersonWorkspaceEntity | undefined }
    >();

    for (const contact of uniqueContacts) {
      if (!contact.handle.includes('@')) {
        shouldCreateOrRestorePeopleByHandleMap.set(
          contact.handle.toLowerCase(),
          {
            existingPerson: undefined,
          },
        );

        continue;
      }
      const existingPerson = alreadyCreatedPeople.find((person) => {
        if (isNonEmptyString(person.emails?.primaryEmail)) {
          return (
            person.emails.primaryEmail.toLowerCase() ===
            contact.handle.toLowerCase()
          );
        }

        if (Array.isArray(person.emails?.additionalEmails)) {
          return person.emails.additionalEmails.some(
            (email) => email.toLowerCase() === contact.handle.toLowerCase(),
          );
        }

        return false;
      });

      shouldCreateOrRestorePeopleByHandleMap.set(contact.handle.toLowerCase(), {
        existingPerson,
      });
    }

    const contactsThatNeedPersonCreate = uniqueContacts.filter(
      (contact) =>
        !shouldCreateOrRestorePeopleByHandleMap.has(
          contact.handle.toLowerCase(),
        ),
    );
    const contactsThatNeedPersonRestore = uniqueContacts.filter((contact) => {
      const existingPerson = shouldCreateOrRestorePeopleByHandleMap.get(
        contact.handle.toLowerCase(),
      )?.existingPerson;

      if (!existingPerson) {
        return false;
      }

      if (!existingPerson.deletedAt) {
        return false;
      }

      return true;
    });

    const filteredContactsToCreateWithCompanyDomainNames = [
      ...contactsThatNeedPersonCreate,
      ...contactsThatNeedPersonRestore,
    ].map((contact) => ({
      handle: contact.handle,
      displayName: contact.displayName,
      companyDomainName: isWorkEmail(contact.handle)
        ? getDomainNameFromHandle(contact.handle)
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

    const peopleToCreate = this.formatPeopleFromContacts({
      contactsToCreate: filteredContactsToCreateWithCompanyDomainNames,
      createdBy: {
        source: source,
        workspaceMember: connectedAccount.accountOwner,
        context: {
          provider: connectedAccount.provider,
        },
      },
      companiesMap: companies,
    });

    const createdOrRestoredPeople =
      await this.createPersonService.createOrRestorePeople(
        peopleToCreate,
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
    const contactsBatches = chunk(
      contactsToCreate,
      CONTACTS_CREATION_BATCH_SIZE,
    );

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

    for (const contactsBatch of contactsBatches) {
      try {
        await this.createCompaniesAndPeople(
          connectedAccount,
          contactsBatch,
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

  formatPeopleFromContacts({
    contactsToCreate,
    createdBy,
    companiesMap,
  }: {
    contactsToCreate: {
      handle: string;
      displayName: string;
      companyDomainName: string | undefined;
    }[];
    createdBy: {
      source: FieldActorSource;
      workspaceMember?: WorkspaceMemberWorkspaceEntity | null;
      context: {
        provider: ConnectedAccountProvider;
      };
    };
    companiesMap: Record<string, string>;
  }): Partial<PersonWorkspaceEntity>[] {
    return contactsToCreate.map((contact) => {
      const id = v4();

      const { handle, displayName, companyDomainName } = contact;

      const { firstName, lastName } =
        getFirstNameAndLastNameFromHandleAndDisplayName(handle, displayName);
      const createdByName = computeDisplayName(createdBy.workspaceMember?.name);

      const companyId = isNonEmptyString(companyDomainName)
        ? companiesMap[companyDomainName]
        : undefined;

      return {
        id,
        emails: {
          primaryEmail: handle.toLowerCase(),
          additionalEmails: null,
        },
        name: {
          firstName,
          lastName,
        },
        companyId,
        createdBy: {
          source: createdBy.source,
          workspaceMemberId: createdBy.workspaceMember?.id ?? null,
          name: createdByName,
          context: createdBy.context,
        },
      };
    });
  }
}
