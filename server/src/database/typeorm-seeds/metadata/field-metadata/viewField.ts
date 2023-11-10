import { DataSource } from 'typeorm';

const tableName = 'fieldMetadata';

export const seedViewFieldFieldMetadata = async (
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
        objectMetadataId: '61d9000b-485c-4c48-a22e-0d9a164f9647',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'fieldMetadataId',
        label: 'Field Metadata Id',
        targetColumnMap: {
          value: 'fieldMetadataId',
        },
        description: 'View Field target field',
        icon: null,
        isNullable: false,
      },
      {
        id: 'a9a56210-a154-4965-9ace-c35f6dc43ee5',
        objectMetadataId: '61d9000b-485c-4c48-a22e-0d9a164f9647',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'RELATION',
        name: 'view',
        label: 'View Id',
        targetColumnMap: { value: 'viewId' },
        description: 'View Field related view',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '61d9000b-485c-4c48-a22e-0d9a164f9647',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'BOOLEAN',
        name: 'isVisible',
        label: 'Visible',
        targetColumnMap: {
          value: 'isVisible',
        },
        description: 'View Field visibility',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '61d9000b-485c-4c48-a22e-0d9a164f9647',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'NUMBER',
        name: 'size',
        label: 'Size',
        targetColumnMap: {
          value: 'size',
        },
        description: 'View Field size',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '61d9000b-485c-4c48-a22e-0d9a164f9647',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'NUMBER',
        name: 'position',
        label: 'Position',
        targetColumnMap: {
          value: 'position',
        },
        description: 'View Field position',
        icon: null,
        isNullable: false,
      },
    ])
    .execute();
};
