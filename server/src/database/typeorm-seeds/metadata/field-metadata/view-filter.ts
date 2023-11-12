import { DataSource } from 'typeorm';

import { SeedWorkspaceId } from 'src/database/seeds/metadata';
import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedViewFilterFieldMetadataIds {
  FieldMetadataId = '20202020-78bb-4f2b-a052-260bc8efd694',
  View = '20202020-65e5-4082-829d-8c634c20e7b5',
  Operand = '20202020-1d12-465d-ab2c-8af008182730',
  Value = '20202020-8b37-46ae-86b8-14287ec06802',
  DisplayValue = '20202020-ed89-4892-83fa-d2b2929c6d52',
}

export const seedViewFilterFieldMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${fieldMetadataTableName}`, [
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
      // View Filters
      {
        id: SeedViewFilterFieldMetadataIds.FieldMetadataId,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
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
        id: SeedViewFilterFieldMetadataIds.View,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'viewId',
        label: 'View Id',
        targetColumnMap: {
          value: 'viewId',
        },
        description: 'View Filter related view',
        icon: 'IconLayoutCollage',
        isNullable: false,
      },
      {
        id: SeedViewFilterFieldMetadataIds.Operand,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
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
        id: SeedViewFilterFieldMetadataIds.Value,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
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
        id: SeedViewFilterFieldMetadataIds.DisplayValue,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
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
