import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedCommentFieldMetadataIds {
  Id = '20202020-2899-42fa-ba07-1f4dad7ae28f',
  CreatedAt = '20202020-88fd-4db2-9fcb-b5f4f5955cf2',
  UpdatedAt = '20202020-63dd-4426-abad-9973fece49ed',

  Body = '20202020-354b-4f10-9425-fa3eb8fddc51',
  Author = '20202020-2c70-40c2-bba6-893780b25d41',
  AuthorForeignKey = '20202021-2c70-40c2-bba6-893780b25d42',
  Activity = '20202020-a9ac-4294-9462-db0f690da906',
  ActivityForeignKey = '20202021-a9ac-4294-9462-db0f690da907',
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
      'isSystem',
      'defaultValue',
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
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'uuid' },
      },
      {
        id: SeedCommentFieldMetadataIds.CreatedAt,
        objectMetadataId: SeedObjectMetadataIds.Comment,
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
        id: SeedCommentFieldMetadataIds.UpdatedAt,
        objectMetadataId: SeedObjectMetadataIds.Comment,
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
      // Scalar fields
      {
        id: SeedCommentFieldMetadataIds.Body,
        objectMetadataId: SeedObjectMetadataIds.Comment,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.TEXT,
        name: 'body',
        label: 'Body',
        targetColumnMap: {
          value: 'body',
        },
        description: 'Comment body',
        icon: 'IconLink',
        isNullable: false,
        isSystem: false,
        defaultValue: { value: '' },
      },
      // Relationships
      {
        id: SeedCommentFieldMetadataIds.Author,
        objectMetadataId: SeedObjectMetadataIds.Comment,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.RELATION,
        name: 'author',
        label: 'Author',
        targetColumnMap: {},
        description: 'Comment author',
        icon: 'IconCircleUser',
        isNullable: true,
        isSystem: false,
        defaultValue: undefined,
      },
      {
        id: SeedCommentFieldMetadataIds.AuthorForeignKey,
        objectMetadataId: SeedObjectMetadataIds.Comment,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: 'authorId',
        label: 'Author id (foreign key)',
        targetColumnMap: {},
        description: 'Comment author id foreign key',
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
      },
      {
        id: SeedCommentFieldMetadataIds.Activity,
        objectMetadataId: SeedObjectMetadataIds.Comment,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.RELATION,
        name: 'activity',
        label: 'Activity',
        targetColumnMap: {},
        description: 'Comment activity',
        icon: 'IconNotes',
        isNullable: true,
        isSystem: false,
        defaultValue: undefined,
      },
      {
        id: SeedCommentFieldMetadataIds.ActivityForeignKey,
        objectMetadataId: SeedObjectMetadataIds.Comment,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: 'activityId',
        label: 'Activity id (foreign key)',
        targetColumnMap: {},
        description: 'Activity id foreign key',
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
      },
    ])
    .execute();
};
