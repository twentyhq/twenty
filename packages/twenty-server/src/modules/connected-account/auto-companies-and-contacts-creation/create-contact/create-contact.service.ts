import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/modules/connected-account/auto-companies-and-contacts-creation/utils/get-first-name-and-last-name-from-handle-and-display-name.util';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type ContactToCreate = {
  handle: string;
  displayName: string;
  companyId?: string;
};

type FormattedContactToCreate = {
  id: string;
  handle: string;
  firstName: string;
  lastName: string;
  companyId?: string;
};

@Injectable()
export class CreateContactService {
  constructor(
    @InjectObjectMetadataRepository(PersonWorkspaceEntity)
    private readonly personRepository: PersonRepository,
  ) {}

  public formatContacts(
    contactsToCreate: ContactToCreate[],
  ): FormattedContactToCreate[] {
    return contactsToCreate.map((contact) => {
      const id = v4();

      const { handle, displayName, companyId } = contact;

      const { firstName, lastName } =
        getFirstNameAndLastNameFromHandleAndDisplayName(handle, displayName);

      return {
        id,
        handle,
        firstName,
        lastName,
        companyId,
      };
    });
  }

  public async createPeople(
    contactsToCreate: ContactToCreate[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PersonWorkspaceEntity[]> {
    if (contactsToCreate.length === 0) return [];

    const formattedContacts = this.formatContacts(contactsToCreate);

    return await this.personRepository.createPeople(
      formattedContacts,
      workspaceId,
      transactionManager,
    );
  }
}
