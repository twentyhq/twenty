import { DataSource } from 'typeorm';

const tableName = 'fieldMetadata';

export const seedViewFieldMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
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
        objectMetadataId: '9ab6b3dc-767f-473f-8fd0-6cdbefbf8dbe',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'name',
        label: 'Name',
        targetColumnMap: {
          value: 'name',
        },
        description: 'View name',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '9ab6b3dc-767f-473f-8fd0-6cdbefbf8dbe',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'objectMetadataId',
        label: 'Object Metadata Id',
        targetColumnMap: {
          value: 'objectMetadataId',
        },
        description: 'View target object',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '9ab6b3dc-767f-473f-8fd0-6cdbefbf8dbe',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'type',
        label: 'Type',
        targetColumnMap: {
          value: 'type',
        },
        description: 'View type',
        icon: null,
        isNullable: false,
      },
      {
        id: '064eb439-fdfa-4246-a13a-989c5bcc4d97',
        objectMetadataId: '9ab6b3dc-767f-473f-8fd0-6cdbefbf8dbe',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'RELATION',
        name: 'viewFields',
        label: 'View Fields',
        targetColumnMap: {},
        description: 'View Fields',
        icon: null,
        isNullable: false,
      },
    ])
    .execute();
};
