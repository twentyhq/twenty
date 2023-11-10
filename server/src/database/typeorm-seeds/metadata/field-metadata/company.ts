import { DataSource } from 'typeorm';

const tableName = 'fieldMetadata';

export const seedCompanyFieldMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'objectMetadataId',
      'isCustom',
      'workspaceId',
      'isActive',
      'type',
      'name',
      'label',
      'targetColumnMap',
      'description',
      'icon',
      'isNullable',
    ])
    .orIgnore()
    .values([
      {
        objectMetadataId: '1a8487a0-480c-434e-b4c7-e22408b97047',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'name',
        label: 'Name',
        targetColumnMap: {
          value: 'name',
        },
        description: 'Name of the company',
        icon: 'IconBuildingSkyscraper',
        isNullable: false,
      },
      {
        objectMetadataId: '1a8487a0-480c-434e-b4c7-e22408b97047',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'domainName',
        label: 'Domain Name',
        targetColumnMap: {
          value: 'domainName',
        },
        description: 'Domain name of the company',
        icon: 'IconLink',
        isNullable: true,
      },
      {
        objectMetadataId: '1a8487a0-480c-434e-b4c7-e22408b97047',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'address',
        label: 'Address',
        targetColumnMap: {
          value: 'address',
        },
        description: 'Address of the company',
        icon: 'IconMap',
        isNullable: true,
      },
      {
        objectMetadataId: '1a8487a0-480c-434e-b4c7-e22408b97047',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'employees',
        label: 'Employees',
        targetColumnMap: {
          value: 'employees',
        },
        description: 'Number of employees',
        icon: 'IconUsers',
        isNullable: true,
      },
    ])
    .execute();
};
