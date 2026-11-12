import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type RlsRuleFieldsOnMatchingRecords = {
  fieldMetadataIds: string[];
  recordFilter: RecordGqlOperationFilter;
};
