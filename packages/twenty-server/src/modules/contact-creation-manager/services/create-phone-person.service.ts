import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { type FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CONTACTS_CREATION_BATCH_SIZE } from 'src/modules/contact-creation-manager/constants/contacts-creation-batch-size.constant';
import { CreatePersonService } from 'src/modules/contact-creation-manager/services/create-person.service';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { computePhoneContactsThatNeedPersonCreateAndRestore } from 'src/modules/contact-creation-manager/utils/compute-phone-contacts-that-need-person-create-and-restore.util';
import { filterOutPhoneContactsThatBelongToConnectedAccount } from 'src/modules/contact-creation-manager/utils/filter-out-phone-contacts-that-belong-to-connected-account.util';
import { formatPhonePeopleToCreateFromContacts } from 'src/modules/contact-creation-manager/utils/format-phone-people-to-create-from-contacts.util';
import { getUniqueContactsAndHandles } from 'src/modules/contact-creation-manager/utils/get-unique-contacts-and-handles.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { parsePhoneHandle } from 'src/utils/parse-phone-handle';

type CreateAndRestorePhonePeopleArgs = {
  connectedAccount: ConnectedAccountEntity;
  contactsToCreate: Contact[];
  workspaceId: string;
  source: FieldActorSource;
  accountOwner: WorkspaceMemberWorkspaceEntity | null;
};

@Injectable()
export class CreatePhonePersonService {
  constructor(
    private readonly createPersonService: CreatePersonService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createAndRestorePeople({
    connectedAccount,
    contactsToCreate,
    workspaceId,
    source,
    accountOwner,
  }: CreateAndRestorePhonePeopleArgs): Promise<void> {
    const contactsBatches = chunk(
      contactsToCreate,
      CONTACTS_CREATION_BATCH_SIZE,
    );

    for (const contactsBatch of contactsBatches) {
      try {
        await this.createAndRestorePeopleBatch({
          connectedAccount,
          contactsToCreate: contactsBatch,
          workspaceId,
          source,
          accountOwner,
        });
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspaceId,
          },
        });
      }
    }
  }

  private async createAndRestorePeopleBatch({
    connectedAccount,
    contactsToCreate,
    workspaceId,
    source,
    accountOwner,
  }: CreateAndRestorePhonePeopleArgs): Promise<void> {
    if (contactsToCreate.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const personRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          PersonWorkspaceEntity,
          {
            shouldBypassPermissionChecks: true,
          },
        );

      const contactsFromOthers =
        filterOutPhoneContactsThatBelongToConnectedAccount(
          contactsToCreate,
          connectedAccount,
        );

      const { uniqueContacts } =
        getUniqueContactsAndHandles(contactsFromOthers);

      if (uniqueContacts.length === 0) {
        return;
      }

      const uniquePhoneNumbers = [
        ...new Set(
          uniqueContacts
            .map(
              (contact) => parsePhoneHandle(contact.handle)?.primaryPhoneNumber,
            )
            .filter(isDefined),
        ),
      ];

      const alreadyCreatedPeople = await this.findPeopleByPhoneNumbers({
        personRepository,
        phoneNumbers: uniquePhoneNumbers,
      });

      const {
        contactsThatNeedPersonCreate,
        contactsThatNeedPersonRestore,
        existingPersonByHandle,
      } = computePhoneContactsThatNeedPersonCreateAndRestore({
        uniqueContacts,
        alreadyCreatedPeople,
      });

      const peopleToCreate = formatPhonePeopleToCreateFromContacts({
        contactsToCreate: contactsThatNeedPersonCreate,
        createdBy: {
          source,
          workspaceMember: accountOwner,
          context: {
            provider: connectedAccount.provider,
          },
        },
      });

      await this.createPersonService.createPeople(peopleToCreate, workspaceId);

      const peopleToRestore = contactsThatNeedPersonRestore
        .map((contact) =>
          existingPersonByHandle.get(contact.handle.toLowerCase()),
        )
        .filter(isDefined)
        .map((existingPerson) => ({
          personId: existingPerson.id,
          companyId: undefined,
        }));

      await this.createPersonService.restorePeople(
        peopleToRestore,
        workspaceId,
      );
    }, authContext);
  }

  private async findPeopleByPhoneNumbers({
    personRepository,
    phoneNumbers,
  }: {
    personRepository: WorkspaceRepository<PersonWorkspaceEntity>;
    phoneNumbers: string[];
  }): Promise<PersonWorkspaceEntity[]> {
    if (phoneNumbers.length === 0) {
      return [];
    }

    const queryBuilder = personRepository
      .createQueryBuilder('person')
      .select([
        'person.id',
        'person.phonesPrimaryPhoneNumber',
        'person.phonesPrimaryPhoneCallingCode',
        'person.phonesAdditionalPhones',
        'person.deletedAt',
      ])
      .where('person.phonesPrimaryPhoneNumber IN (:...phoneNumbers)', {
        phoneNumbers,
      })
      .withDeleted();

    for (const [index, phoneNumber] of phoneNumbers.entries()) {
      const phoneNumberParamName = `phoneNumber${index}`;

      queryBuilder.orWhere(
        `person.phonesAdditionalPhones @> :${phoneNumberParamName}::jsonb`,
        {
          [phoneNumberParamName]: JSON.stringify([{ number: phoneNumber }]),
        },
      );
    }

    return queryBuilder.orderBy('person.createdAt', 'ASC').getMany();
  }
}
