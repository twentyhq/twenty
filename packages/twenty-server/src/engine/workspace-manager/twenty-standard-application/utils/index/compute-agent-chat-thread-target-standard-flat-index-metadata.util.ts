import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildAgentChatThreadTargetStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'agentChatThreadTarget'>, 'context'>,
): Record<
  AllStandardObjectIndexName<'agentChatThreadTarget'>,
  FlatIndexMetadata
> => ({
  threadIdIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'threadIdIndex',
      relatedFieldNames: ['thread'],
    },
  }),
  // The record page asks for every thread attached to one record, so the
  // target pair leads.
  targetRecordIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'targetRecordIndex',
      relatedFieldNames: ['objectMetadataId', 'recordId'],
    },
  }),
  threadTargetUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'threadTargetUniqueIndex',
      relatedFieldNames: ['thread', 'objectMetadataId', 'recordId'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
  }),
});
