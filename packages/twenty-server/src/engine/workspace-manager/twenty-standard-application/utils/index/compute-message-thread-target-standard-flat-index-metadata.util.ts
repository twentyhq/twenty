import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import { type CreateStandardIndexArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';
import { buildStandardTargetFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/build-standard-target-flat-index-metadatas.util';

export const buildMessageThreadTargetStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'messageThreadTarget'>, 'context'>,
): Record<
  AllStandardObjectIndexName<'messageThreadTarget'>,
  FlatIndexMetadata
> => {
  const indexes = buildStandardTargetFlatIndexMetadatas({
    args,
    fieldNames: {
      parent: 'messageThread',
      person: 'targetPerson',
      company: 'targetCompany',
      opportunity: 'targetOpportunity',
    },
    indexNames: {
      parentIdIndex: 'messageThreadIdIndex',
      personIdIndex: 'personIdIndex',
      companyIdIndex: 'companyIdIndex',
      opportunityIdIndex: 'opportunityIdIndex',
      personUniqueIndex: 'messageThreadPersonUniqueIndex',
      companyUniqueIndex: 'messageThreadCompanyUniqueIndex',
      opportunityUniqueIndex: 'messageThreadOpportunityUniqueIndex',
    },
  });

  return {
    messageThreadIdIndex: indexes.parentIdIndex,
    personIdIndex: indexes.personIdIndex,
    companyIdIndex: indexes.companyIdIndex,
    opportunityIdIndex: indexes.opportunityIdIndex,
    messageThreadPersonUniqueIndex: indexes.personUniqueIndex,
    messageThreadCompanyUniqueIndex: indexes.companyUniqueIndex,
    messageThreadOpportunityUniqueIndex: indexes.opportunityUniqueIndex,
  };
};
