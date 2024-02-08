import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
@Injectable()
export class CreateContactService {
  constructor() {}

  async createContactFromHandle(
    handle: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ) {
    const existingPerson = await manager.query(
      `SELECT * FROM ${dataSourceMetadata.schema}.person WHERE handle = $1`,
      [handle],
    );

    if (existingPerson.length > 0) {
      return existingPerson[0];
    }

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.person (email) VALUES ($1)`,
      [handle],
    );
  }
}
