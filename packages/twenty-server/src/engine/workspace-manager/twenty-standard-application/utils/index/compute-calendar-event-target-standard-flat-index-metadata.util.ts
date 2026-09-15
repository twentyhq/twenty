import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import { type CreateStandardIndexArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';
import { buildStandardTargetFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/build-standard-target-flat-index-metadatas.util';

export const buildCalendarEventTargetStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'calendarEventTarget'>, 'context'>,
): Record<
  AllStandardObjectIndexName<'calendarEventTarget'>,
  FlatIndexMetadata
> => {
  const indexes = buildStandardTargetFlatIndexMetadatas({
    args,
    fieldNames: {
      parent: 'calendarEvent',
      person: 'targetPerson',
      company: 'targetCompany',
      opportunity: 'targetOpportunity',
    },
    indexNames: {
      parentIdIndex: 'calendarEventIdIndex',
      personIdIndex: 'personIdIndex',
      companyIdIndex: 'companyIdIndex',
      opportunityIdIndex: 'opportunityIdIndex',
      personUniqueIndex: 'calendarEventPersonUniqueIndex',
      companyUniqueIndex: 'calendarEventCompanyUniqueIndex',
      opportunityUniqueIndex: 'calendarEventOpportunityUniqueIndex',
    },
  });

  return {
    calendarEventIdIndex: indexes.parentIdIndex,
    personIdIndex: indexes.personIdIndex,
    companyIdIndex: indexes.companyIdIndex,
    opportunityIdIndex: indexes.opportunityIdIndex,
    calendarEventPersonUniqueIndex: indexes.personUniqueIndex,
    calendarEventCompanyUniqueIndex: indexes.companyUniqueIndex,
    calendarEventOpportunityUniqueIndex: indexes.opportunityUniqueIndex,
  };
};
