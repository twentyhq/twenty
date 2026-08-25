import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildCalendarEventTargetStandardFlatIndexMetadatas = (
  args: Omit<CreateStandardIndexArgs<'calendarEventTarget'>, 'context'>,
): Record<
  AllStandardObjectIndexName<'calendarEventTarget'>,
  FlatIndexMetadata
> => ({
  calendarEventIdIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'calendarEventIdIndex',
      relatedFieldNames: ['calendarEvent'],
    },
  }),
  calendarEventPersonUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'calendarEventPersonUniqueIndex',
      relatedFieldNames: ['calendarEvent', 'targetPerson'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
  }),
  calendarEventCompanyUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'calendarEventCompanyUniqueIndex',
      relatedFieldNames: ['calendarEvent', 'targetCompany'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
  }),
  calendarEventOpportunityUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: 'calendarEventOpportunityUniqueIndex',
      relatedFieldNames: ['calendarEvent', 'targetOpportunity'],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
  }),
});
