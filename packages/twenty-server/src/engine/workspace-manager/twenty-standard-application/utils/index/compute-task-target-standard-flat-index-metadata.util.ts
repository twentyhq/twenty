import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import { type CreateStandardIndexArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';
import { buildStandardTargetFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/build-standard-target-flat-index-metadatas.util';

export const buildTaskTargetStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'taskTarget'>, 'context'>,
): Record<AllStandardObjectIndexName<'taskTarget'>, FlatIndexMetadata> => {
  const indexes = buildStandardTargetFlatIndexMetadatas({
    args,
    fieldNames: {
      parent: 'task',
      person: 'targetPerson',
      company: 'targetCompany',
      opportunity: 'targetOpportunity',
    },
    indexNames: {
      parentIdIndex: 'taskIdIndex',
      personIdIndex: 'personIdIndex',
      companyIdIndex: 'companyIdIndex',
      opportunityIdIndex: 'opportunityIdIndex',
      personUniqueIndex: 'taskPersonUniqueIndex',
      companyUniqueIndex: 'taskCompanyUniqueIndex',
      opportunityUniqueIndex: 'taskOpportunityUniqueIndex',
    },
  });

  return {
    taskIdIndex: indexes.parentIdIndex,
    personIdIndex: indexes.personIdIndex,
    companyIdIndex: indexes.companyIdIndex,
    opportunityIdIndex: indexes.opportunityIdIndex,
    taskPersonUniqueIndex: indexes.personUniqueIndex,
    taskCompanyUniqueIndex: indexes.companyUniqueIndex,
    taskOpportunityUniqueIndex: indexes.opportunityUniqueIndex,
  };
};
