import { DataSource } from 'typeorm';

import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedPipelineStepFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/pipeline-step';
import { SeedOpportunityFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/opportunity';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const tableName = 'relationMetadata';

export const seedPipelineStepRelationMetadata = async (
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
        fromObjectMetadataId: SeedObjectMetadataIds.PipelineStep,
        toObjectMetadataId: SeedObjectMetadataIds.Opportunity,
        fromFieldMetadataId: SeedPipelineStepFieldMetadataIds.Opportunities,
        toFieldMetadataId: SeedOpportunityFieldMetadataIds.PipelineStep,
        workspaceId: SeedWorkspaceId,
      },
    ])
    .execute();
};
