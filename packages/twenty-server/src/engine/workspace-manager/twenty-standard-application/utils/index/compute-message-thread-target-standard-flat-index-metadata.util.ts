import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildMessageThreadTargetStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'messageThreadTarget'>, 'context'>,
): Record<
  AllStandardObjectIndexName<'messageThreadTarget'>,
  FlatIndexMetadata
> => ({
  messageThreadIdIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'messageThreadIdIndex',
      relatedFieldNames: ['messageThread'],
    },
  }),
  messageThreadPersonUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'messageThreadPersonUniqueIndex',
      relatedFieldNames: ['messageThread', 'targetPerson'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL AND "targetPersonId" IS NOT NULL',
    },
  }),
  messageThreadCompanyUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'messageThreadCompanyUniqueIndex',
      relatedFieldNames: ['messageThread', 'targetCompany'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL AND "targetCompanyId" IS NOT NULL',
    },
  }),
  messageThreadOpportunityUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'messageThreadOpportunityUniqueIndex',
      relatedFieldNames: ['messageThread', 'targetOpportunity'],
      isUnique: true,
      indexWhereClause:
        '"deletedAt" IS NULL AND "targetOpportunityId" IS NOT NULL',
    },
  }),
});
