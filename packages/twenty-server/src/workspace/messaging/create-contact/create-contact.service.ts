import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { capitalize } from 'src/utils/capitalize';

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
  constructor() {}

  formatContacts(
    contactsToCreate: ContactToCreate[],
  ): FormattedContactToCreate[] {
    return contactsToCreate.map((contact) => {
      const { handle, displayName, companyId } = contact;

      const contactFirstName = displayName.split(' ')[0];
      const contactLastName = displayName.split(' ')[1];

      const contactFullNameFromHandle = handle.split('@')[0];
      const contactFirstNameFromHandle =
        contactFullNameFromHandle.split('.')[0];
      const contactLastNameFromHandle = contactFullNameFromHandle.split('.')[1];

      const id = v4();

      return {
        id,
        handle,
        firstName: capitalize(
          contactFirstName || contactFirstNameFromHandle || '',
        ),
        lastName: capitalize(
          contactLastName || contactLastNameFromHandle || '',
        ),
        companyId,
      };
    });
  }

  async createContacts(
    contactsToCreate: ContactToCreate[],
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (contactsToCreate.length === 0) return;

    const formattedContacts = this.formatContacts(contactsToCreate);

    const valuesString = formattedContacts
      .map(
        (_, index) =>
          `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${
            index * 5 + 4
          }, $${index * 5 + 5})`,
      )
      .join(', ');

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.person (id, email, "nameFirstName", "nameLastName", "companyId") VALUES ${valuesString}`,
      formattedContacts
        .map((contact) => [
          contact.id,
          contact.handle,
          contact.firstName,
          contact.lastName,
          contact.companyId,
        ])
        .flat(),
    );
  }
}
