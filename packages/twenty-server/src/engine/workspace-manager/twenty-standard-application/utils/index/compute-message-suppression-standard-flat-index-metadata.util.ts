import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildMessageSuppressionStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'messageSuppression'>, 'context'>): Record<
  AllStandardObjectIndexName<'messageSuppression'>,
  FlatIndexMetadata
> => ({
  // Two partial unique indexes instead of one on (emailAddress, topic): Postgres
  // treats NULLs as distinct, so a single index would let duplicate global rows
  // (topicId IS NULL) through. One enforces a single global block per address,
  // the other a single per-topic opt-out per (address, topic).
  emailAddressGlobalUniqueIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'emailAddressGlobalUniqueIndex',
      relatedFieldNames: ['emailAddress'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL AND "topicId" IS NULL',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  emailAddressTopicUniqueIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'emailAddressTopicUniqueIndex',
      relatedFieldNames: ['emailAddress', 'topic'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL AND "topicId" IS NOT NULL',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  searchVectorGinIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'searchVectorGinIndex',
      relatedFieldNames: ['searchVector'],
      indexType: IndexType.GIN,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
});
