import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildMessageTopicSubscriptionStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'messageTopicSubscription'>, 'context'>): Record<
  AllStandardObjectIndexName<'messageTopicSubscription'>,
  FlatIndexMetadata
> => ({
  topicIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'topicIdIndex',
      relatedFieldNames: ['topic'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  personTopicUniqueIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'personTopicUniqueIndex',
      relatedFieldNames: ['person', 'topic'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
});
