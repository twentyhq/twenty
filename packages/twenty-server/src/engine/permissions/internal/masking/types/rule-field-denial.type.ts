import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type RuleFieldDenial = {
  recordFilter: RecordGqlOperationFilter;
  unreadableFieldMetadataIds: string[];
};
