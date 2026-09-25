import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import { type CreateStandardIndexArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';
import { buildStandardTargetFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/build-standard-target-flat-index-metadatas.util';

export const buildAgentChatThreadTargetStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'agentChatThreadTarget'>, 'context'>,
): Record<
  AllStandardObjectIndexName<'agentChatThreadTarget'>,
  FlatIndexMetadata
> => {
  const indexes = buildStandardTargetFlatIndexMetadatas({
    args,
    fieldNames: {
      parent: 'thread',
      person: 'targetPerson',
      company: 'targetCompany',
      opportunity: 'targetOpportunity',
    },
    indexNames: {
      parentIdIndex: 'threadIdIndex',
      personIdIndex: 'personIdIndex',
      companyIdIndex: 'companyIdIndex',
      opportunityIdIndex: 'opportunityIdIndex',
      personUniqueIndex: 'threadPersonUniqueIndex',
      companyUniqueIndex: 'threadCompanyUniqueIndex',
      opportunityUniqueIndex: 'threadOpportunityUniqueIndex',
    },
  });

  return {
    threadIdIndex: indexes.parentIdIndex,
    personIdIndex: indexes.personIdIndex,
    companyIdIndex: indexes.companyIdIndex,
    opportunityIdIndex: indexes.opportunityIdIndex,
    threadPersonUniqueIndex: indexes.personUniqueIndex,
    threadCompanyUniqueIndex: indexes.companyUniqueIndex,
    threadOpportunityUniqueIndex: indexes.opportunityUniqueIndex,
  };
};
