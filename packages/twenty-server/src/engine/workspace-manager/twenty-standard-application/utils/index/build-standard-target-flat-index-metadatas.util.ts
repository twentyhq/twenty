import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

type StandardTargetObjectName = 'calendarEventTarget' | 'messageThreadTarget';

type TargetIndexNames<T extends StandardTargetObjectName> = {
  parentIdIndex: AllStandardObjectIndexName<T>;
  personIdIndex: AllStandardObjectIndexName<T>;
  companyIdIndex: AllStandardObjectIndexName<T>;
  opportunityIdIndex: AllStandardObjectIndexName<T>;
  personUniqueIndex: AllStandardObjectIndexName<T>;
  companyUniqueIndex: AllStandardObjectIndexName<T>;
  opportunityUniqueIndex: AllStandardObjectIndexName<T>;
};

type TargetFieldNames<T extends StandardTargetObjectName> = {
  parent: AllStandardObjectFieldName<T>;
  person: AllStandardObjectFieldName<T>;
  company: AllStandardObjectFieldName<T>;
  opportunity: AllStandardObjectFieldName<T>;
};

type BuiltTargetIndexes = {
  parentIdIndex: FlatIndexMetadata;
  personIdIndex: FlatIndexMetadata;
  companyIdIndex: FlatIndexMetadata;
  opportunityIdIndex: FlatIndexMetadata;
  personUniqueIndex: FlatIndexMetadata;
  companyUniqueIndex: FlatIndexMetadata;
  opportunityUniqueIndex: FlatIndexMetadata;
};

export const buildStandardTargetFlatIndexMetadatas = <
  T extends StandardTargetObjectName,
>({
  args,
  fieldNames,
  indexNames,
}: {
  args: Omit<CreateStandardIndexArgs<T>, 'context'>;
  fieldNames: TargetFieldNames<T>;
  indexNames: TargetIndexNames<T>;
}): BuiltTargetIndexes => ({
  parentIdIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: indexNames.parentIdIndex,
      relatedFieldNames: [fieldNames.parent],
    },
  }),
  personIdIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: indexNames.personIdIndex,
      relatedFieldNames: [fieldNames.person],
    },
  }),
  companyIdIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: indexNames.companyIdIndex,
      relatedFieldNames: [fieldNames.company],
    },
  }),
  opportunityIdIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: indexNames.opportunityIdIndex,
      relatedFieldNames: [fieldNames.opportunity],
    },
  }),
  personUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: indexNames.personUniqueIndex,
      relatedFieldNames: [fieldNames.parent, fieldNames.person],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
  }),
  companyUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: indexNames.companyUniqueIndex,
      relatedFieldNames: [fieldNames.parent, fieldNames.company],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
  }),
  opportunityUniqueIndex: createStandardIndexFlatMetadata({
    ...args,
    context: {
      indexName: indexNames.opportunityUniqueIndex,
      relatedFieldNames: [fieldNames.parent, fieldNames.opportunity],
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    },
  }),
});
