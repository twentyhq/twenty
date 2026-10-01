import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildMessageSuppressionStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'messageSuppression'>, 'context'>,
): Record<string, FlatIndexMetadata> => ({
  emailAddressTopicUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'emailAddressTopicUniqueIndex',
      relatedFieldNames: ['emailAddress', 'unsubscribeTopicId'],
      isUnique: true,
      indexWhereClause: null,
    },
  }),
});
