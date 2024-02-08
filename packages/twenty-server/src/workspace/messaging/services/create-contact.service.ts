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
  ) {}
}
