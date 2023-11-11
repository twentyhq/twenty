import { DataSource } from 'typeorm';

const tableName = 'fieldMetadata';

export const seedViewSortFieldMetadata = async (
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
        objectMetadataId: '6f8dcd4b-cf28-41dd-b98b-d6e1f5b3a251',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'fieldMetadataId',
        label: 'Field Metadata Id',
        targetColumnMap: {
          value: 'fieldMetadataId',
        },
        description: 'View Sort target field',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '6f8dcd4b-cf28-41dd-b98b-d6e1f5b3a251',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'viewId',
        label: 'View Id',
        targetColumnMap: {
          value: 'viewId',
        },
        description: 'View Sort related view',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '6f8dcd4b-cf28-41dd-b98b-d6e1f5b3a251',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'direction',
        label: 'Direction',
        targetColumnMap: {
          value: 'direction',
        },
        description: 'View Sort direction',
        icon: null,
        isNullable: false,
      },
    ])
    .execute();
};
