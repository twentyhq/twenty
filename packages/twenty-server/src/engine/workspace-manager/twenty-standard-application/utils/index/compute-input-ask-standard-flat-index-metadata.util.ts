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
  // What an assignee's inbox reads: everything still waiting on them.
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
  // One Ask per run step, enforced here rather than by the read that precedes
  // the insert: a retried or concurrently resumed step would otherwise pass
  // that read twice and ask the same question twice. Its leading column also
  // serves the lookups by run alone, so those need no index of their own.
  // Partial, or a soft-deleted row would hold the key against a reopen that
  // cannot see it.
  workflowRunStepUniqueIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowRunStepUniqueIndex',
      relatedFieldNames: ['workflowRun', 'stepId'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  // How a proposed tool call finds its Ask, the way a run step finds its own
  // through workflowRunId.
  toolCallIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'toolCallIdIndex',
      relatedFieldNames: ['toolCallId'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
});
