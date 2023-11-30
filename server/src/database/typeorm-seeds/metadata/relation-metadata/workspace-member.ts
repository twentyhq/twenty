import { DataSource } from 'typeorm';

import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedCompanyFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/company';
import { SeedWorkspaceMemberFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/workspace-member';
import { SeedFavoriteFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/favorite';
import { SeedActivityFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/activity';
import { SeedCommentFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/comment';
import { SeedAttachmentFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/attachment';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const tableName = 'relationMetadata';

export const seedWorkspaceMemberRelationMetadata = async (
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
        fromObjectMetadataId: SeedObjectMetadataIds.WorkspaceMember,
        toObjectMetadataId: SeedObjectMetadataIds.Company,
        fromFieldMetadataId:
          SeedWorkspaceMemberFieldMetadataIds.AccountOwnerForCompanies,
        toFieldMetadataId: SeedCompanyFieldMetadataIds.AccountOwner,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.WorkspaceMember,
        toObjectMetadataId: SeedObjectMetadataIds.Favorite,
        fromFieldMetadataId: SeedWorkspaceMemberFieldMetadataIds.Favorites,
        toFieldMetadataId: SeedFavoriteFieldMetadataIds.WorkspaceMember,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.WorkspaceMember,
        toObjectMetadataId: SeedObjectMetadataIds.Activity,
        fromFieldMetadataId:
          SeedWorkspaceMemberFieldMetadataIds.AuthoredActivities,
        toFieldMetadataId: SeedActivityFieldMetadataIds.Author,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.WorkspaceMember,
        toObjectMetadataId: SeedObjectMetadataIds.Activity,
        fromFieldMetadataId:
          SeedWorkspaceMemberFieldMetadataIds.AssignedActivities,
        toFieldMetadataId: SeedActivityFieldMetadataIds.Assignee,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.WorkspaceMember,
        toObjectMetadataId: SeedObjectMetadataIds.Comment,
        fromFieldMetadataId:
          SeedWorkspaceMemberFieldMetadataIds.AuthoredComments,
        toFieldMetadataId: SeedCommentFieldMetadataIds.Author,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.WorkspaceMember,
        toObjectMetadataId: SeedObjectMetadataIds.Attachment,
        fromFieldMetadataId:
          SeedWorkspaceMemberFieldMetadataIds.AuthoredAttachments,
        toFieldMetadataId: SeedAttachmentFieldMetadataIds.Author,
        workspaceId: SeedWorkspaceId,
      },
    ])
    .execute();
};
