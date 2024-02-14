import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { PersonService } from 'src/workspace/messaging/repositories/person/person.service';
import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/workspace/messaging/utils/get-first-name-and-last-name-from-handle-and-display-name.util';

type ContactToCreate = {
  handle: string;
  displayName: string;
  companyId: string;
};

type FormattedContactToCreate = {
  id: string;
  handle: string;
  firstName: string;
  lastName: string;
  companyId: string;
};

@Injectable()
export class CreateContactService {
  constructor(private readonly personService: PersonService) {}

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

    await this.personService.createPeople(
      formattedContacts,
      workspaceId,
      transactionManager,
    );
  }
}
