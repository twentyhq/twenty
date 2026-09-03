import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import { type CreateStandardIndexArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';
import { buildStandardTargetFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/build-standard-target-flat-index-metadatas.util';

export const buildNoteTargetStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'noteTarget'>, 'context'>,
): Record<AllStandardObjectIndexName<'noteTarget'>, FlatIndexMetadata> => {
  const indexes = buildStandardTargetFlatIndexMetadatas({
    args,
    fieldNames: {
      parent: 'note',
      person: 'targetPerson',
      company: 'targetCompany',
      opportunity: 'targetOpportunity',
    },
    indexNames: {
      parentIdIndex: 'noteIdIndex',
      personIdIndex: 'personIdIndex',
      companyIdIndex: 'companyIdIndex',
      opportunityIdIndex: 'opportunityIdIndex',
      personUniqueIndex: 'notePersonUniqueIndex',
      companyUniqueIndex: 'noteCompanyUniqueIndex',
      opportunityUniqueIndex: 'noteOpportunityUniqueIndex',
    },
  });

  return {
    noteIdIndex: indexes.parentIdIndex,
    personIdIndex: indexes.personIdIndex,
    companyIdIndex: indexes.companyIdIndex,
    opportunityIdIndex: indexes.opportunityIdIndex,
    notePersonUniqueIndex: indexes.personUniqueIndex,
    noteCompanyUniqueIndex: indexes.companyUniqueIndex,
    noteOpportunityUniqueIndex: indexes.opportunityUniqueIndex,
  };
};
