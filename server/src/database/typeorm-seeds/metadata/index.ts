import { DataSource } from 'typeorm';

import { seedCompanyFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/company';
import { seedViewFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/view';
import { seedViewFieldFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/view-field';
import { seedViewFilterFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/view-filter';
import { seedViewSortFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/view-sort';
import { seedObjectMetadata } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { seedViewRelationMetadata } from 'src/database/typeorm-seeds/metadata/relation-metadata/view';
import { seedActivityTargetFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/activity-target';
import { seedActivityFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/activity';
import { seedApiKeyFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/api-key';
import { seedAttachmentFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/attachment';
import { seedCommentFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/comment';
import { seedFavoriteFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/favorite';
import { seedOpportunityFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/opportunity';
import { seedPersonFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/person';
import { seedPipelineStepFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/pipeline-step';
import { seedWorkspaceMemberFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/workspace-member';
import { seedCompanyRelationMetadata } from 'src/database/typeorm-seeds/metadata/relation-metadata/company';
import { seedActivityRelationMetadata } from 'src/database/typeorm-seeds/metadata/relation-metadata/activity';
import { seedPipelineStepRelationMetadata } from 'src/database/typeorm-seeds/metadata/relation-metadata/pipeline-step';
import { seedPersonRelationMetadata } from 'src/database/typeorm-seeds/metadata/relation-metadata/person';
import { seedWorkspaceMemberRelationMetadata } from 'src/database/typeorm-seeds/metadata/relation-metadata/workspace-member';
import { seedDataSource } from 'src/database/typeorm-seeds/metadata/data-source';

export const seedMetadataSchema = async (
  workspaceDataSource: DataSource,
  workspaceId: string,
  dataSourceId: string,
  workspaceSchemaName: string,
) => {
  const schemaName = 'metadata';
  await seedDataSource(
    workspaceDataSource,
    schemaName,
    workspaceId,
    dataSourceId,
    workspaceSchemaName,
  );
  await seedObjectMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
    dataSourceId,
  );

  await seedActivityTargetFieldMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedActivityFieldMetadata(workspaceDataSource, schemaName, workspaceId);
  await seedApiKeyFieldMetadata(workspaceDataSource, schemaName, workspaceId);
  await seedAttachmentFieldMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedCommentFieldMetadata(workspaceDataSource, schemaName, workspaceId);

  await seedCompanyFieldMetadata(workspaceDataSource, schemaName, workspaceId);
  await seedFavoriteFieldMetadata(workspaceDataSource, schemaName, workspaceId);
  await seedOpportunityFieldMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedPersonFieldMetadata(workspaceDataSource, schemaName, workspaceId);
  await seedPipelineStepFieldMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedViewFieldMetadata(workspaceDataSource, schemaName, workspaceId);
  await seedViewFieldFieldMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedViewFilterFieldMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedViewSortFieldMetadata(workspaceDataSource, schemaName, workspaceId);
  await seedViewRelationMetadata(workspaceDataSource, schemaName, workspaceId);
  await seedWorkspaceMemberFieldMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );

  await seedActivityRelationMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedCompanyRelationMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedPersonRelationMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedPipelineStepRelationMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
  await seedViewRelationMetadata(workspaceDataSource, schemaName, workspaceId);
  await seedWorkspaceMemberRelationMetadata(
    workspaceDataSource,
    schemaName,
    workspaceId,
  );
};
