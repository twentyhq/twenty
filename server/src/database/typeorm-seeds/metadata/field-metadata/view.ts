import { DataSource } from 'typeorm';

import { SeedWorkspaceId } from 'src/database/seeds/metadata';
import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedViewFieldMetadataIds {
  Name = '20202020-e10e-4346-8690-b2e582ebc03c',
  ObjectMetadataId = '20202020-2c69-46f0-9cf2-1a4f9869d560',
  Type = '20202020-2c70-46f0-9cf2-1a4f9869d591',
  ViewFields = '20202020-d288-4df4-9548-7b5c5747f623',
  ViewSorts = '20202020-3011-4d5c-8133-c01134e733df',
  ViewFilters = '20202020-afe8-40bc-9a81-9b33e45131d9',
}

export const seedViewFieldMetadata = async (
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
        id: SeedViewFieldMetadataIds.Name,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
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
        id: SeedViewFieldMetadataIds.ObjectMetadataId,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
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
        id: SeedViewFieldMetadataIds.Type,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
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
        id: SeedViewFieldMetadataIds.ViewFields,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'viewFields',
        label: 'View Fields',
        targetColumnMap: {},
        description: 'View Fields',
        icon: 'IconTag',
        isNullable: true,
      },
      {
        id: SeedViewFieldMetadataIds.ViewSorts,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'viewSorts',
        label: 'View Sorts',
        targetColumnMap: {},
        description: 'View Sorts',
        icon: 'IconArrowsSort',
        isNullable: true,
      },
      {
        id: SeedViewFieldMetadataIds.ViewFilters,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'viewFilters',
        label: 'View Filters',
        targetColumnMap: {},
        description: 'View Filters',
        icon: 'IconFilterBolt',
        isNullable: true,
      },
    ])
    .execute();
};
