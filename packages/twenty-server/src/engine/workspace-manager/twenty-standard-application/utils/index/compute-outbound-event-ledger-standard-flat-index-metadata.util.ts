import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildOutboundEventLedgerStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'outboundEventLedger'>, 'context'>): Record<
  AllStandardObjectIndexName<'outboundEventLedger'>,
  FlatIndexMetadata
> => ({
  idempotencyKeyIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'idempotencyKeyIndex',
      relatedFieldNames: ['idempotencyKey'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  eventIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'eventIdIndex',
      relatedFieldNames: ['eventId'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  statusIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'statusIndex',
      relatedFieldNames: ['status'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
});
