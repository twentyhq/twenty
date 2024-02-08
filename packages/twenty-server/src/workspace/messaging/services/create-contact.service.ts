import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

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
  ): Promise<string | undefined> {
    if (!handle) {
      return;
    }

    const contactFirstName = displayName.split(' ')[0];
    const contactLastName = displayName.split(' ')[1];

    const contactFullNameFromHandle = handle.split('@')[0];
    const contactFirstNameFromHandle = contactFullNameFromHandle.split('.')[0];
    const contactLastNameFromHandle = contactFullNameFromHandle.split('.')[1];

    const id = v4();

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.person (id, email, "nameFirstName", "nameLastName") VALUES ($1, $2, $3, $4)`,
      [
        id,
        handle,
        capitalize(contactFirstName || contactFirstNameFromHandle || ''),
        capitalize(contactLastName || contactLastNameFromHandle || ''),
      ],
    );

    return id;
  }
}
