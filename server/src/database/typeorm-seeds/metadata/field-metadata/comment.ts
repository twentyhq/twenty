import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedCommentFieldMetadataIds {
  Id = '20202020-2899-42fa-ba07-1f4dad7ae28f',
  CreatedAt = '20202020-88fd-4db2-9fcb-b5f4f5955cf2',
  UpdatedAt = '20202020-63dd-4426-abad-9973fece49ed',

  Body = '20202020-354b-4f10-9425-fa3eb8fddc51',

  Author = '20202020-2c70-40c2-bba6-893780b25d41',
  Activity = '20202020-a9ac-4294-9462-db0f690da906',
}

export const seedCommentFieldMetadata = async (
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
        id: SeedCommentFieldMetadataIds.Id,
        objectMetadataId: SeedObjectMetadataIds.Comment,
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
        id: SeedCommentFieldMetadataIds.CreatedAt,
        objectMetadataId: SeedObjectMetadataIds.Comment,
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
        id: SeedCommentFieldMetadataIds.UpdatedAt,
        objectMetadataId: SeedObjectMetadataIds.Comment,
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
      // Scalar fields
      {
        id: SeedCommentFieldMetadataIds.Body,
        objectMetadataId: SeedObjectMetadataIds.Comment,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'body',
        label: 'Body',
        targetColumnMap: {
          value: 'body',
        },
        description: 'Comment body',
        icon: 'IconLink',
        isNullable: false,
      },
      // Relationships
      {
        id: SeedCommentFieldMetadataIds.Author,
        objectMetadataId: SeedObjectMetadataIds.Comment,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'author',
        label: 'Author',
        targetColumnMap: {
          value: 'authorId',
        },
        description: 'Comment author',
        icon: 'IconCircleUser',
        isNullable: false,
      },
      {
        id: SeedCommentFieldMetadataIds.Activity,
        objectMetadataId: SeedObjectMetadataIds.Comment,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'activity',
        label: 'Activity',
        targetColumnMap: {
          value: 'activityId',
        },
        description: 'Comment activity',
        icon: 'IconNotes',
        isNullable: false,
      },
    ])
    .execute();
};
