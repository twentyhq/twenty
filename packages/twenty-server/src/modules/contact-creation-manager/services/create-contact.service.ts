import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import camelCase from 'lodash.camelcase';

import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/modules/contact-creation-manager/utils/get-first-name-and-last-name-from-handle-and-display-name.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FieldCreatedBySource } from 'src/engine/metadata-modules/field-metadata/composite-types/created-by.composite-type';

type ContactToCreate = {
  handle: string;
  displayName: string;
  companyId?: string;
  source: FieldCreatedBySource;
};

@Injectable()
export class CreateContactService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private formatContacts(
    contactsToCreate: ContactToCreate[],
  ): DeepPartial<PersonWorkspaceEntity>[] {
    return contactsToCreate.map((contact) => {
      const id = v4();

      const { handle, displayName, companyId, source } = contact;

      const { firstName, lastName } =
        getFirstNameAndLastNameFromHandleAndDisplayName(handle, displayName);

      return {
        id,
        handle,
        name: {
          firstName,
          lastName,
        },
        companyId,
        // TODO: We need to add workspaceMemberId here, for that a system like loadServiceWithContext
        // is needed so we can get the user id from the context when this service is called from a job
        createdBy: {
          source,
          name: camelCase(source),
        },
      };
    });
  }

  public async createPeople(
    contactsToCreate: ContactToCreate[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (contactsToCreate.length === 0) return [];

    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        PersonWorkspaceEntity,
      );

    const formattedContacts = this.formatContacts(contactsToCreate);

    return personRepository.save(
      formattedContacts,
      undefined,
      transactionManager,
    );
  }
}
