import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildCampaignDeliveryStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'campaignDelivery'>, 'context'>,
): Record<string, FlatIndexMetadata> => ({
  campaignPersonUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'campaignPersonUniqueIndex',
      relatedFieldNames: ['campaignId', 'personId'],
      isUnique: true,
      indexWhereClause: null,
    },
  }),
  expiredClaimIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'expiredClaimIndex',
      relatedFieldNames: ['claimExpiresAt'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
  countsIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'countsIndex',
      relatedFieldNames: ['campaignId', 'state'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
  claimTokenIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'claimTokenIndex',
      relatedFieldNames: ['claimToken'],
      isUnique: false,
      indexWhereClause: null,
    },
  }),
  providerMessageIdUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'providerMessageIdUniqueIndex',
      relatedFieldNames: ['providerMessageId'],
      isUnique: true,
      indexWhereClause: null,
    },
  }),
});
