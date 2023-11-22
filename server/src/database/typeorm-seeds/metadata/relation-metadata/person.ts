import { DataSource } from 'typeorm';

import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedFavoriteFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/favorite';
import { SeedPersonFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/person';
import { SeedActivityTargetFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/activity-target';
import { SeedAttachmentFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/attachment';
import { SeedOpportunityFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/opportunity';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const tableName = 'relationMetadata';

export const seedPersonRelationMetadata = async (
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
        fromObjectMetadataId: SeedObjectMetadataIds.Person,
        toObjectMetadataId: SeedObjectMetadataIds.Favorite,
        fromFieldMetadataId: SeedPersonFieldMetadataIds.Favorites,
        toFieldMetadataId: SeedFavoriteFieldMetadataIds.Person,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Person,
        toObjectMetadataId: SeedObjectMetadataIds.Attachment,
        fromFieldMetadataId: SeedPersonFieldMetadataIds.Attachments,
        toFieldMetadataId: SeedAttachmentFieldMetadataIds.Person,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Person,
        toObjectMetadataId: SeedObjectMetadataIds.Opportunity,
        fromFieldMetadataId: SeedPersonFieldMetadataIds.Opportunities,
        toFieldMetadataId: SeedOpportunityFieldMetadataIds.Person,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Person,
        toObjectMetadataId: SeedObjectMetadataIds.Opportunity,
        fromFieldMetadataId: SeedPersonFieldMetadataIds.ContactForOpportunities,
        toFieldMetadataId: SeedOpportunityFieldMetadataIds.PointOfContact,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.Person,
        toObjectMetadataId: SeedObjectMetadataIds.ActivityTarget,
        fromFieldMetadataId: SeedPersonFieldMetadataIds.ActivityTargets,
        toFieldMetadataId: SeedActivityTargetFieldMetadataIds.Person,
        workspaceId: SeedWorkspaceId,
      },
    ])
    .execute();
};
