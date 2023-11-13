import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedViewSortFieldMetadataIds {
  FieldMetadataId = '20202020-cb2c-4c8f-a289-c9851b23d064',
  View = '20202020-f5d0-467f-a3d8-395ba16b8ebf',
  Direction = '20202020-077e-4451-b1d8-e602c956ebd2',
}

export const seedViewSortFieldMetadata = async (
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
        id: SeedViewSortFieldMetadataIds.FieldMetadataId,
        objectMetadataId: SeedObjectMetadataIds.ViewSort,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
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
        id: SeedViewSortFieldMetadataIds.View,
        objectMetadataId: SeedObjectMetadataIds.ViewSort,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'viewId',
        label: 'View Id',
        targetColumnMap: {
          value: 'viewId',
        },
        description: 'View Sort related view',
        icon: 'IconLayoutCollage',
        isNullable: false,
      },
      {
        id: SeedViewSortFieldMetadataIds.Direction,
        objectMetadataId: SeedObjectMetadataIds.ViewSort,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
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
