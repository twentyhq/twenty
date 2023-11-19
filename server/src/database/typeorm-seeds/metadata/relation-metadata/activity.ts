import { DataSource } from 'typeorm';

import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedActivityFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/activity';
import { SeedActivityTargetFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/activity-target';
import { SeedAttachmentFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/attachment';
import { SeedCommentFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/comment';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const tableName = 'relationMetadata';

export const seedActivityRelationMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'relationType',
      'fromObjectMetadataId',
      'toObjectMetadataId',
      'fromFieldMetadataId',
      'toFieldMetadataId',
      'workspaceId',
    ])
    .orIgnore()
    .values([
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Activity,
        toObjectMetadataId: SeedObjectMetadataIds.ActivityTarget,
        fromFieldMetadataId: SeedActivityFieldMetadataIds.ActivityTargets,
        toFieldMetadataId: SeedActivityTargetFieldMetadataIds.Activity,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Activity,
        toObjectMetadataId: SeedObjectMetadataIds.Attachment,
        fromFieldMetadataId: SeedActivityFieldMetadataIds.Attachments,
        toFieldMetadataId: SeedAttachmentFieldMetadataIds.Activity,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Activity,
        toObjectMetadataId: SeedObjectMetadataIds.Comment,
        fromFieldMetadataId: SeedActivityFieldMetadataIds.Comments,
        toFieldMetadataId: SeedCommentFieldMetadataIds.Activity,
        workspaceId: SeedWorkspaceId,
      },
    ])
    .execute();
};
