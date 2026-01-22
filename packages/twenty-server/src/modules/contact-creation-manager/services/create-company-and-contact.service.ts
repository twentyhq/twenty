import { Injectable } from '@nestjs/common';

import { isNonEmptyString, isNull } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import compact from 'lodash.compact';
import {
  ConnectedAccountProvider,
  type FieldActorSource,
} from 'twenty-shared/types';
import { getCountryCodesForCallingCode, isDefined } from 'twenty-shared/utils';
import { type DeepPartial } from 'typeorm';
import { v4 } from 'uuid';
import { parsePhoneNumber } from 'libphonenumber-js/max';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CONTACTS_CREATION_BATCH_SIZE } from 'src/modules/contact-creation-manager/constants/contacts-creation-batch-size.constant';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreatePersonService } from 'src/modules/contact-creation-manager/services/create-person.service';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { filterOutContactsThatBelongToSelfOrWorkspaceMembers } from 'src/modules/contact-creation-manager/utils/filter-out-contacts-that-belong-to-self-or-workspace-members.util';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/modules/contact-creation-manager/utils/get-first-name-and-last-name-from-handle-and-display-name.util';
import { getUniqueContactsAndHandles } from 'src/modules/contact-creation-manager/utils/get-unique-contacts-and-handles.util';
import { addPersonEmailAndPhoneNumberFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-and-phone-number-filters-to-query-builder';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { computeDisplayName } from 'src/utils/compute-display-name';
import { isWorkDomain, isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
export class CreateCompanyAndPersonService {
  constructor(
    private readonly createPersonService: CreatePersonService,
    private readonly createCompaniesService: CreateCompanyService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createCompaniesAndPeople(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    contactsToCreate: Contact[],
    workspaceId: string,
    source: FieldActorSource,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (!contactsToCreate || contactsToCreate.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            PersonWorkspaceEntity,
            {
              shouldBypassPermissionChecks: true,
            },
          );

        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            WorkspaceMemberWorkspaceEntity,
          );

        const workspaceMembers = await workspaceMemberRepository.find();

        const peopleToCreateFromOtherCompanies =
          filterOutContactsThatBelongToSelfOrWorkspaceMembers(
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

        const queryBuilder = addPersonEmailAndPhoneNumberFiltersToQueryBuilder({
          queryBuilder: personRepository.createQueryBuilder('person'),
          emailsOrPhoneNumbers: uniqueHandles,
        }); // TODO: technically it'd be easier to find people with their whatsapp id, add different query builder?

        const alreadyCreatedPeople = await queryBuilder
          .orderBy('person.createdAt', 'ASC')
          .withDeleted()
          .getMany();

        const {
          contactsThatNeedPersonCreate,
          contactsThatNeedPersonRestore,
          workDomainNamesToCreate,
          shouldCreateOrRestorePeopleByHandleMap,
        } =
          this.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            uniqueContacts,
            alreadyCreatedPeople,
            source,
            connectedAccount,
          );

        const companiesMap =
          await this.createCompaniesService.createOrRestoreCompanies(
            workDomainNamesToCreate,
            workspaceId,
          );

        const peopleToCreate = this.formatPeopleToCreateFromContacts({
          contactsToCreate: contactsThatNeedPersonCreate,
          createdBy: {
            source: source,
            workspaceMember: connectedAccount.accountOwner,
            context: {
              provider: connectedAccount.provider,
            },
          },
          companiesMap,
        });

        const createdPeople = await this.createPersonService.createPeople(
          peopleToCreate,
          workspaceId,
        );

        const peopleToRestore = this.formatPeopleToRestoreFromContacts({
          contactsToRestore: contactsThatNeedPersonRestore,
          companiesMap,
          shouldCreateOrRestorePeopleByHandleMap,
        });

        const restoredPeople = await this.createPersonService.restorePeople(
          peopleToRestore,
          workspaceId,
        );

        return { ...createdPeople, ...restoredPeople };
      },
    );
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

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        if (!connectedAccount.accountOwner) {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository(
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
      },
    );

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

  computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
    uniqueContacts: Contact[],
    alreadyCreatedPeople: PersonWorkspaceEntity[],
    source: FieldActorSource,
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ) {
    const shouldCreateOrRestorePeopleByHandleMap = new Map<
      string,
      { existingPerson: PersonWorkspaceEntity }
    >();

    for (const contact of uniqueContacts) {
      if (!contact.handle.includes('@')) {
        const parsedNumber = parsePhoneNumber(contact.handle);
        const existingPersonOnPrimaryPhoneNumber = alreadyCreatedPeople.find(
          (person) => {
            return (
              // country flag is unnecessary as main focus is on phone number
              person.phones.primaryPhoneNumber ===
                parsedNumber.nationalNumber &&
              person.phones.primaryPhoneCallingCode ===
                parsedNumber.countryCallingCode
            );
          },
        );

        if (isDefined(existingPersonOnPrimaryPhoneNumber)) {
          shouldCreateOrRestorePeopleByHandleMap.set(contact.handle, {
            existingPerson: existingPersonOnPrimaryPhoneNumber,
          });
          continue;
        }

        const existingPersonOnAdditionalPhoneNumber = alreadyCreatedPeople.find(
          (person) => {
            return person.phones.additionalPhones?.includes({
              number: parsedNumber.nationalNumber,
              callingCode: parsedNumber.countryCallingCode,
              countryCode: getCountryCodesForCallingCode(
                parsedNumber.countryCallingCode,
              )[0], // TODO: ^ this will fail if country code isn't matching, how to fix it?
            });
          },
        );

        if (!isDefined(existingPersonOnAdditionalPhoneNumber)) continue;

        shouldCreateOrRestorePeopleByHandleMap.set(contact.handle, {
          existingPerson: existingPersonOnAdditionalPhoneNumber,
        });
      } else {
        const existingPersonOnPrimaryEmail = alreadyCreatedPeople.find(
          (person) => {
            return (
              isNonEmptyString(person.emails?.primaryEmail) &&
              person.emails.primaryEmail.toLowerCase() ===
                contact.handle.toLowerCase()
            );
          },
        );

        if (isDefined(existingPersonOnPrimaryEmail)) {
          shouldCreateOrRestorePeopleByHandleMap.set(
            contact.handle.toLowerCase(),
            {
              existingPerson: existingPersonOnPrimaryEmail,
            },
          );
          continue;
        }

        const existingPersonOnAdditionalEmails = alreadyCreatedPeople.find(
          (person) => {
            return (
              Array.isArray(person.emails?.additionalEmails) &&
              person.emails.additionalEmails.some(
                (email) => email.toLowerCase() === contact.handle.toLowerCase(),
              )
            );
          },
        );

        if (!isDefined(existingPersonOnAdditionalEmails)) continue;

        shouldCreateOrRestorePeopleByHandleMap.set(
          contact.handle.toLowerCase(),
          {
            existingPerson: existingPersonOnAdditionalEmails,
          },
        );
      }
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

      if (!isDefined(existingPerson)) {
        return false;
      }

      return !isNull(existingPerson.deletedAt);
    });

    const workDomainNamesToCreate =
      source === 'EMAIL'
        ? compact(
            [...contactsThatNeedPersonCreate, ...contactsThatNeedPersonRestore]
              .map((contact) => {
                const companyDomainName = isWorkEmail(contact.handle)
                  ? getDomainNameFromHandle(contact.handle)
                  : undefined;

                if (
                  !isDefined(companyDomainName) ||
                  !isWorkDomain(companyDomainName)
                )
                  return undefined;

                return {
                  domainName: companyDomainName,
                  createdBySource: source,
                  createdByWorkspaceMember: connectedAccount.accountOwner,
                  createdByContext: {
                    provider: connectedAccount.provider,
                  },
                };
              })
              .filter(isDefined),
          )
        : [];

    return {
      contactsThatNeedPersonCreate,
      contactsThatNeedPersonRestore,
      workDomainNamesToCreate,
      shouldCreateOrRestorePeopleByHandleMap,
    };
  }

  formatPeopleToCreateFromContacts({
    contactsToCreate,
    createdBy,
    companiesMap,
  }: {
    contactsToCreate: {
      handle: string;
      displayName: string;
      whatsAppId?: string;
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

      const { handle, displayName } = contact;

      const { firstName, lastName } =
        getFirstNameAndLastNameFromHandleAndDisplayName(handle, displayName);
      const createdByName = computeDisplayName(createdBy.workspaceMember?.name);

      if (handle.includes('@')) {
        const companyId = companiesMap[getDomainNameFromHandle(handle)];

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
      } else {
        const phoneNumber = parsePhoneNumber(handle);
        const callingCode = phoneNumber.countryCallingCode;
        const number = phoneNumber.nationalNumber;
        const countryCode = getCountryCodesForCallingCode(callingCode)[0]; // TODO: still not sure about this approach, may cause some discrepancies, is it possible to totally skip country code?

        return {
          id,
          phones: {
            primaryPhoneNumber: number,
            primaryPhoneCallingCode: callingCode,
            primaryPhoneCountryCode: countryCode,
            additionalPhones: null,
          },
          name: {
            firstName,
            lastName,
          },
          createdBy: {
            source: createdBy.source,
            workspaceMemberId: null,
            name: createdByName,
            context: createdBy.context,
          },
          whatsAppId: contact.whatsAppId ?? null,
        };
      }
    });
  }

  formatPeopleToRestoreFromContacts({
    contactsToRestore,
    companiesMap,
    shouldCreateOrRestorePeopleByHandleMap,
  }: {
    contactsToRestore: {
      handle: string;
      displayName: string;
    }[];
    companiesMap: Record<string, string>;
    shouldCreateOrRestorePeopleByHandleMap: Map<
      string,
      { existingPerson: PersonWorkspaceEntity | undefined }
    >;
  }): { personId: string; companyId: string | undefined }[] {
    const peopleToRestore = [];

    for (const contact of contactsToRestore) {
      const { handle } = contact;

      const existingPerson = shouldCreateOrRestorePeopleByHandleMap.get(
        handle.toLowerCase(),
      )?.existingPerson;

      if (!isDefined(existingPerson) || isNull(existingPerson.deletedAt))
        continue;

      const companyId = companiesMap[getDomainNameFromHandle(handle)];

      peopleToRestore.push({
        personId: existingPerson.id,
        companyId,
      });
    }

    return peopleToRestore;
  }
}
