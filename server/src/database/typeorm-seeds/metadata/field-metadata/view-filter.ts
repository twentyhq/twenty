import { DataSource } from 'typeorm';

const tableName = 'fieldMetadata';

export const seedViewFilterFieldMetadata = async (
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
      // View Filters
      {
        objectMetadataId: '5d9b1ab9-4461-4e2d-bf9e-9b47e68846d3',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'fieldMetadataId',
        label: 'Field Metadata Id',
        targetColumnMap: {
          value: 'fieldMetadataId',
        },
        description: 'View Filter target field',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '5d9b1ab9-4461-4e2d-bf9e-9b47e68846d3',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'viewId',
        label: 'View Id',
        targetColumnMap: {
          value: 'viewId',
        },
        description: 'View Filter related view',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '5d9b1ab9-4461-4e2d-bf9e-9b47e68846d3',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'operand',
        label: 'Operand',
        targetColumnMap: {
          value: 'operand',
        },
        description: 'View Filter operand',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '5d9b1ab9-4461-4e2d-bf9e-9b47e68846d3',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'value',
        label: 'Value',
        targetColumnMap: {
          value: 'value',
        },
        description: 'View Filter value',
        icon: null,
        isNullable: false,
      },
      {
        objectMetadataId: '5d9b1ab9-4461-4e2d-bf9e-9b47e68846d3',
        isCustom: false,
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        isActive: true,
        type: 'TEXT',
        name: 'displayValue',
        label: 'Display Value',
        targetColumnMap: {
          value: 'displayValue',
        },
        description: 'View Filter Display Value',
        icon: null,
        isNullable: false,
      },
    ])
    .execute();
};
