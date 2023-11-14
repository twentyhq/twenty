import { DataSource } from 'typeorm';

import { SeedViewIds } from 'src/database/typeorm-seeds/tenant/views';
import { SeedCompanyFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/company';

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
        viewId: SeedViewIds.PrismaCompany,
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: 'domainName',
        viewId: SeedViewIds.PrismaCompany,
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId: 'accountOwner',
        viewId: SeedViewIds.PrismaCompany,
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'createdAt',
        viewId: SeedViewIds.PrismaCompany,
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'employees',
        viewId: SeedViewIds.PrismaCompany,
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'linkedin',
        viewId: SeedViewIds.PrismaCompany,
        position: 5,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: 'address',
        viewId: SeedViewIds.PrismaCompany,
        position: 6,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: 'displayName',
        viewId: SeedViewIds.PrismaPerson,
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId: 'email',
        viewId: SeedViewIds.PrismaPerson,
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'company',
        viewId: SeedViewIds.PrismaPerson,
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'phone',
        viewId: SeedViewIds.PrismaPerson,
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'createdAt',
        viewId: SeedViewIds.PrismaPerson,
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'city',
        viewId: SeedViewIds.PrismaPerson,
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'jobTitle',
        viewId: SeedViewIds.PrismaPerson,
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'linkedin',
        viewId: SeedViewIds.PrismaPerson,
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'x',
        viewId: SeedViewIds.PrismaPerson,
        position: 8,
        isVisible: true,
        size: 150,
      },

      {
        fieldMetadataId: SeedCompanyFieldMetadataIds.Name,
        viewId: SeedViewIds.Company,
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: SeedCompanyFieldMetadataIds.DomainName,
        viewId: SeedViewIds.Company,
        position: 1,
        isVisible: true,
        size: 100,
      },
    ])
    .execute();
};
