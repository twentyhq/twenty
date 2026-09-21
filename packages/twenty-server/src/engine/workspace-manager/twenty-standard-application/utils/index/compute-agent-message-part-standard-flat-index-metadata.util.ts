import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildAgentMessagePartStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'agentMessagePart'>, 'context'>,
): Record<string, FlatIndexMetadata> => ({
  messageOrderIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'messageOrderIndex',
      relatedFieldNames: ['message', 'orderIndex'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
});
