import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedCommentFieldMetadataIds {
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
