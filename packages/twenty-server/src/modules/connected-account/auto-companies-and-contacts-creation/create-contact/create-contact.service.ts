import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/modules/messaging/utils/get-first-name-and-last-name-from-handle-and-display-name.util';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';

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
    @InjectObjectMetadataRepository(PersonObjectMetadata)
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

  public async createContacts(
    contactsToCreate: ContactToCreate[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (contactsToCreate.length === 0) return;

    const formattedContacts = this.formatContacts(contactsToCreate);

    await this.personRepository.createPeople(
      formattedContacts,
      workspaceId,
      transactionManager,
    );
  }
}
