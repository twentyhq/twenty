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
import { seedWebhookFieldMetadata } from 'src/database/typeorm-seeds/metadata/field-metadata/webhook';

export const seedMetadataSchema = async (workspaceDataSource: DataSource) => {
  const schemaName = 'metadata';

  await seedDataSource(workspaceDataSource, schemaName);
  await seedObjectMetadata(workspaceDataSource, schemaName);

  await seedActivityTargetFieldMetadata(workspaceDataSource, schemaName);
  await seedActivityFieldMetadata(workspaceDataSource, schemaName);
  await seedApiKeyFieldMetadata(workspaceDataSource, schemaName);
  await seedAttachmentFieldMetadata(workspaceDataSource, schemaName);
  await seedWebhookFieldMetadata(workspaceDataSource, schemaName);
  await seedCommentFieldMetadata(workspaceDataSource, schemaName);
  await seedCompanyFieldMetadata(workspaceDataSource, schemaName);
  await seedFavoriteFieldMetadata(workspaceDataSource, schemaName);
  await seedOpportunityFieldMetadata(workspaceDataSource, schemaName);
  await seedPersonFieldMetadata(workspaceDataSource, schemaName);
  await seedPipelineStepFieldMetadata(workspaceDataSource, schemaName);
  await seedViewFieldMetadata(workspaceDataSource, schemaName);
  await seedViewFieldFieldMetadata(workspaceDataSource, schemaName);
  await seedViewFilterFieldMetadata(workspaceDataSource, schemaName);
  await seedViewSortFieldMetadata(workspaceDataSource, schemaName);
  await seedViewRelationMetadata(workspaceDataSource, schemaName);
  await seedWorkspaceMemberFieldMetadata(workspaceDataSource, schemaName);

  await seedActivityRelationMetadata(workspaceDataSource, schemaName);
  await seedCompanyRelationMetadata(workspaceDataSource, schemaName);
  await seedPersonRelationMetadata(workspaceDataSource, schemaName);
  await seedPipelineStepRelationMetadata(workspaceDataSource, schemaName);
  await seedViewRelationMetadata(workspaceDataSource, schemaName);
  await seedWorkspaceMemberRelationMetadata(workspaceDataSource, schemaName);
};
