import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedActivityTargetFieldMetadataIds {
  Id = '20202020-7db7-4dac-8093-ea0a12e9466f',
  CreatedAt = '20202020-585f-48fa-a4b6-97cf7f86315e',
  UpdatedAt = '20202020-4cf0-4478-8c68-62a855622a99',

  Activity = '20202020-cb21-42c9-bba8-347f7cb02b84',
  Person = '20202020-e56c-43e6-8fce-5619d8c2293a',
  Company = '20202020-9408-4cc0-9fe1-51467edb530b',
}

export const seedActivityTargetFieldMetadata = async (
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
      // Default fields
      {
        id: SeedActivityTargetFieldMetadataIds.Id,
        objectMetadataId: SeedObjectMetadataIds.ActivityTarget,
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
        isNullable: true,
        // isSystem: true,
      },
      {
        id: SeedActivityTargetFieldMetadataIds.CreatedAt,
        objectMetadataId: SeedObjectMetadataIds.ActivityTarget,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE,
        name: 'createdAt',
        label: 'Creation date',
        targetColumnMap: {
          value: 'createdAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: true,
      },
      {
        id: SeedActivityTargetFieldMetadataIds.UpdatedAt,
        objectMetadataId: SeedObjectMetadataIds.ActivityTarget,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE,
        name: 'updatedAt',
        label: 'Update date',
        targetColumnMap: {
          value: 'updatedAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: true,
      },
      // Relationships
      {
        id: SeedActivityTargetFieldMetadataIds.Activity,
        objectMetadataId: SeedObjectMetadataIds.ActivityTarget,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'activity',
        label: 'Activity',
        targetColumnMap: {
          value: 'activityId',
        },
        description: 'ActivityTarget activity',
        icon: 'IconNotes',
        isNullable: false,
      },
      {
        id: SeedActivityTargetFieldMetadataIds.Activity,
        objectMetadataId: SeedObjectMetadataIds.ActivityTarget,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'activity',
        label: 'Activity',
        targetColumnMap: {
          value: 'activityId',
        },
        description: 'ActivityTarget activity',
        icon: 'IconNotes',
        isNullable: false,
      },
      {
        id: SeedActivityTargetFieldMetadataIds.Person,
        objectMetadataId: SeedObjectMetadataIds.ActivityTarget,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'person',
        label: 'Person',
        targetColumnMap: {
          value: 'personId',
        },
        description: 'ActivityTarget person',
        icon: 'IconUser',
        isNullable: true,
      },
      {
        id: SeedActivityTargetFieldMetadataIds.Company,
        objectMetadataId: SeedObjectMetadataIds.ActivityTarget,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'company',
        label: 'Company',
        targetColumnMap: {
          value: 'companyId',
        },
        description: 'ActivityTarget company',
        icon: 'IconBuildingSkyscraper',
        isNullable: true,
      },
    ])
    .execute();
};
