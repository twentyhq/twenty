import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';

const tableName = 'view';

export const enum SeedViewIds {
  Company = '20202020-2441-4424-8163-4002c523d415',
  Person = '20202020-1979-447d-8115-593744eb4ead',
  Opportunity = '20202020-b2b3-48a5-96ce-0936d6af21f7',
}

export const seedViews = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'objectMetadataId',
      'type',
    ])
    .orIgnore()
    .values([
      {
        id: SeedViewIds.Company,
        name: 'All Companies',
        objectMetadataId: SeedObjectMetadataIds.Company,
        type: 'table',
      },
      {
        id: SeedViewIds.Person,
        name: 'All People',
        objectMetadataId: SeedObjectMetadataIds.Person,
        type: 'table',
      },
      {
        id: SeedViewIds.Opportunity,
        name: 'All Opportunities',
        objectMetadataId: SeedObjectMetadataIds.Opportunity,
        type: 'kanban',
      },
    ])
    .execute();
};
