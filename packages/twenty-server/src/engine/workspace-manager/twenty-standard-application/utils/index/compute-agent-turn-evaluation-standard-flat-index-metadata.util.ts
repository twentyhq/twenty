import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildAgentTurnEvaluationStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'agentTurnEvaluation'>, 'context'>,
): Record<string, FlatIndexMetadata> => ({
  turnIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'turnIndex',
      relatedFieldNames: ['turn'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
});
