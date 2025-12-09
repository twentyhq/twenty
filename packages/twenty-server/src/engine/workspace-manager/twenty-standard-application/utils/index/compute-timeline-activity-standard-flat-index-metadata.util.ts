import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildTimelineActivityStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'timelineActivity'>, 'context'>): Record<
  AllStandardObjectIndexName<'timelineActivity'>,
  FlatIndexMetadata
> => ({
  workspaceMemberIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workspaceMemberIdIndex',
      relatedFieldNames: ['workspaceMember'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  personIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'personIdIndex',
      relatedFieldNames: ['person'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  companyIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'companyIdIndex',
      relatedFieldNames: ['company'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  opportunityIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'opportunityIdIndex',
      relatedFieldNames: ['opportunity'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  noteIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'noteIdIndex',
      relatedFieldNames: ['note'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  taskIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'taskIdIndex',
      relatedFieldNames: ['task'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  workflowIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowIdIndex',
      relatedFieldNames: ['workflow'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  workflowVersionIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowVersionIdIndex',
      relatedFieldNames: ['workflowVersion'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  workflowRunIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowRunIdIndex',
      relatedFieldNames: ['workflowRun'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  dashboardIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'dashboardIdIndex',
      relatedFieldNames: ['dashboard'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
});
