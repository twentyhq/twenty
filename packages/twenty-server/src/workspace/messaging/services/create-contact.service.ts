import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
@Injectable()
export class CreateContactService {
  constructor() {}

  async createContactFromHandleAndDisplayName(
    handle: string,
    displayName: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<void> {
    const existingContact = await manager.query(
      `SELECT * FROM ${dataSourceMetadata.schema}.person WHERE handle = $1`,
      [handle],
    );

    if (existingContact.length > 0) {
      return existingContact[0];
    }

    const contactFirstName = displayName.split(' ')[0];
    const contactLastName = displayName.split(' ')[1];

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.person (email, nameFirstName, nameLastName) VALUES ($1, $2, $3)`,
      [handle, contactFirstName, contactLastName],
    );
  }
}
