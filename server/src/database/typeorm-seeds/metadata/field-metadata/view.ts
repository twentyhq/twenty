import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedViewFieldMetadataIds {
  Id = '20202020-2957-4431-b3b5-879b5e687c6e',
  CreatedAt = '20202020-ad91-42b0-b654-cbd981ddb5bf',
  UpdatedAt = '20202020-b4e6-4044-8f6e-886c6eb2a67c',

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
      'isSystem',
      'defaultValue',
    ])
    .orIgnore()
    .values([
      // Default fields
      {
        id: SeedViewFieldMetadataIds.Id,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: 'id',
        label: 'Id',
        targetColumnMap: {
          value: 'id',
        },
        description: undefined,
        icon: undefined,
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'uuid' },
      },
      {
        id: SeedViewFieldMetadataIds.CreatedAt,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE_TIME,
        name: 'createdAt',
        label: 'Creation date',
        targetColumnMap: {
          value: 'createdAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'now' },
      },
      {
        id: SeedViewFieldMetadataIds.UpdatedAt,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE_TIME,
        name: 'updatedAt',
        label: 'Update date',
        targetColumnMap: {
          value: 'updatedAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'now' },
      },
      // Fields
      {
        id: SeedViewFieldMetadataIds.Name,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.TEXT,
        name: 'name',
        label: 'Name',
        targetColumnMap: {
          value: 'name',
        },
        description: 'View name',
        icon: null,
        isNullable: false,
        isSystem: false,
        defaultValue: { value: '' },
      },
      {
        id: SeedViewFieldMetadataIds.ObjectMetadataId,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: 'objectMetadataId',
        label: 'Object Metadata Id',
        targetColumnMap: {
          value: 'objectMetadataId',
        },
        description: 'View target object',
        icon: null,
        isNullable: false,
        isSystem: false,
        defaultValue: undefined,
      },
      {
        id: SeedViewFieldMetadataIds.Type,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.TEXT,
        name: 'type',
        label: 'Type',
        targetColumnMap: {
          value: 'type',
        },
        description: 'View type',
        icon: null,
        isNullable: false,
        isSystem: false,
        defaultValue: { value: 'table' },
      },
      {
        id: SeedViewFieldMetadataIds.ViewFields,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.RELATION,
        name: 'viewFields',
        label: 'View Fields',
        targetColumnMap: {},
        description: 'View Fields',
        icon: 'IconTag',
        isNullable: true,
        isSystem: false,
        defaultValue: undefined,
      },
      {
        id: SeedViewFieldMetadataIds.ViewSorts,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.RELATION,
        name: 'viewSorts',
        label: 'View Sorts',
        targetColumnMap: {},
        description: 'View Sorts',
        icon: 'IconArrowsSort',
        isNullable: true,
        isSystem: false,
        defaultValue: undefined,
      },
      {
        id: SeedViewFieldMetadataIds.ViewFilters,
        objectMetadataId: SeedObjectMetadataIds.View,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.RELATION,
        name: 'viewFilters',
        label: 'View Filters',
        targetColumnMap: {},
        description: 'View Filters',
        icon: 'IconFilterBolt',
        isNullable: true,
        isSystem: false,
        defaultValue: undefined,
      },
    ])
    .execute();
};
