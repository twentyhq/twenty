import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildInputAskStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'inputAsk'>, 'context'>): Record<
  AllStandardObjectIndexName<'inputAsk'>,
  FlatIndexMetadata
> => ({
  assigneeStatusIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'assigneeStatusIndex',
      relatedFieldNames: ['assignee', 'status'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  // One Ask per form step of a run, enforced here rather than by the read
  // that precedes the insert: a retried or concurrently resumed step would
  // otherwise pass that read twice and ask the same question twice. Partial,
  // or a soft-deleted row would hold the key against a reopen that cannot see
  // it, and an agent's questions, keyed by their tool call, would collide.
  workflowRunStepUniqueIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowRunStepUniqueIndex',
      relatedFieldNames: ['workflowRun', 'stepId'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL AND "toolCallId" IS NULL',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  // What ending a run reads: every Ask of the run still pending, form or
  // agent alike, which the partial unique index above cannot serve.
  workflowRunStatusIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowRunStatusIndex',
      relatedFieldNames: ['workflowRun', 'status'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  // An agent can ask several times in one conversation, one Ask per call.
  threadToolCallUniqueIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'threadToolCallUniqueIndex',
      relatedFieldNames: ['thread', 'toolCallId'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL AND "toolCallId" IS NOT NULL',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
});
