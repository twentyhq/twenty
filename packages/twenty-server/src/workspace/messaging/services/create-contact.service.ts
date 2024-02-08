import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { capitalize } from 'src/utils/capitalize';
@Injectable()
export class CreateContactService {
  constructor() {}

  async createContactFromHandleAndDisplayName(
    handle: string,
    displayName: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!handle) {
      return;
    }

    const existingContact = await manager.query(
      `SELECT * FROM ${dataSourceMetadata.schema}.person WHERE email = $1`,
      [handle],
    );

    if (existingContact.length > 0) {
      return existingContact[0];
    }

    const contactFirstName = displayName.split(' ')[0];
    const contactLastName = displayName.split(' ')[1];

    const contactFullNameFromHandle = handle.split('@')[0];
    const contactFirstNameFromHandle = contactFullNameFromHandle.split('.')[0];
    const contactLastNameFromHandle = contactFullNameFromHandle.split('.')[1];

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.person (email, "nameFirstName", "nameLastName") VALUES ($1, $2, $3)`,
      [
        handle,
        capitalize(contactFirstName || contactFirstNameFromHandle || ''),
        capitalize(contactLastName || contactLastNameFromHandle || ''),
      ],
    );
  }
}
