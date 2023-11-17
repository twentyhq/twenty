import { DataSource } from 'typeorm';

import { SeedViewIds } from 'src/database/typeorm-seeds/workspace/views';

const tableName = 'viewField';

export const seedViewFields = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'fieldMetadataId',
      'viewId',
      'position',
      'isVisible',
      'size',
    ])
    .orIgnore()
    .values([
      {
        fieldMetadataId: 'name',
        viewId: SeedViewIds.Company,
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: 'domainName',
        viewId: SeedViewIds.Company,
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId: 'accountOwner',
        viewId: SeedViewIds.Company,
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'createdAt',
        viewId: SeedViewIds.Company,
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'employees',
        viewId: SeedViewIds.Company,
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'linkedin',
        viewId: SeedViewIds.Company,
        position: 5,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: 'address',
        viewId: SeedViewIds.Company,
        position: 6,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: 'displayName',
        viewId: SeedViewIds.Person,
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId: 'email',
        viewId: SeedViewIds.Person,
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'company',
        viewId: SeedViewIds.Person,
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'phone',
        viewId: SeedViewIds.Person,
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'createdAt',
        viewId: SeedViewIds.Person,
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'city',
        viewId: SeedViewIds.Person,
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'jobTitle',
        viewId: SeedViewIds.Person,
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'linkedin',
        viewId: SeedViewIds.Person,
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'x',
        viewId: SeedViewIds.Person,
        position: 8,
        isVisible: true,
        size: 150,
      },

      {
        fieldMetadataId: 'amount',
        viewId: SeedViewIds.Opportunity,
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'closeDate',
        viewId: SeedViewIds.Opportunity,
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'probability',
        viewId: SeedViewIds.Opportunity,
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'pointOfContact',
        viewId: SeedViewIds.Opportunity,
        position: 3,
        isVisible: true,
        size: 150,
      },
    ])
    .execute();
};
