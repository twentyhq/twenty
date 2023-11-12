import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedViewFieldFieldMetadataIds {
  FieldMetadataId = '20202020-1a5e-4ac1-9530-c7fff8481b79',
  IsVisible = '20202020-3aa9-42db-a74d-0fd6b7cb7c4a',
  Size = '20202020-b9a1-4c2e-a5af-3a6b4fef4af6',
  Position = '20202020-a4bb-440a-add2-81dbd9a74517',
  View = '20202020-8788-4508-b771-719807b60e61',
}

export const seedViewFieldFieldMetadata = async (
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
      {
        id: SeedViewFieldFieldMetadataIds.FieldMetadataId,
        objectMetadataId: SeedObjectMetadataIds.ViewField,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'fieldMetadataId',
        label: 'Field Metadata Id',
        targetColumnMap: {
          value: 'fieldMetadataId',
        },
        description: 'View Field target field',
        icon: 'IconTag',
        isNullable: false,
      },
      {
        id: SeedViewFieldFieldMetadataIds.View,
        objectMetadataId: SeedObjectMetadataIds.ViewField,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'view',
        label: 'View Id',
        targetColumnMap: { value: 'viewId' },
        description: 'View Field related view',
        icon: 'IconLayoutCollage',
        isNullable: false,
      },
      {
        id: SeedViewFieldFieldMetadataIds.IsVisible,
        objectMetadataId: SeedObjectMetadataIds.ViewField,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'BOOLEAN',
        name: 'isVisible',
        label: 'Visible',
        targetColumnMap: {
          value: 'isVisible',
        },
        description: 'View Field visibility',
        icon: 'IconEye',
        isNullable: false,
      },
      {
        id: SeedViewFieldFieldMetadataIds.Size,
        objectMetadataId: SeedObjectMetadataIds.ViewField,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'NUMBER',
        name: 'size',
        label: 'Size',
        targetColumnMap: {
          value: 'size',
        },
        description: 'View Field size',
        icon: 'IconEye',
        isNullable: false,
      },
      {
        id: SeedViewFieldFieldMetadataIds.Position,
        objectMetadataId: SeedObjectMetadataIds.ViewField,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'NUMBER',
        name: 'position',
        label: 'Position',
        targetColumnMap: {
          value: 'position',
        },
        description: 'View Field position',
        icon: 'IconList',
        isNullable: false,
      },
    ])
    .execute();
};
