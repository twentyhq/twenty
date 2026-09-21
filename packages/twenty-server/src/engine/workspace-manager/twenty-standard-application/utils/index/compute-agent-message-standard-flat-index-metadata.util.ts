import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildAgentMessageStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'agentMessage'>, 'context'>,
): Record<string, FlatIndexMetadata> => ({
  agentIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'agentIndex',
      relatedFieldNames: ['agentId'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
  threadIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'threadIndex',
      relatedFieldNames: ['thread'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
  turnIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'turnIndex',
      relatedFieldNames: ['turn'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
  hiddenKickoffIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'hiddenKickoffIndex',
      relatedFieldNames: ['thread'],
      isUnique: true,
      indexWhereClause: '"isHidden" = true AND "deletedAt" IS NULL',
    },
  }),
});
