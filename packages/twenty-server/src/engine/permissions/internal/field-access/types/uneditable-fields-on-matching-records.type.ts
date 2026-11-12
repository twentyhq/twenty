import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type UneditableFieldsOnMatchingRecords = {
  fieldMetadataIds: string[];
  recordFilter: RecordGqlOperationFilter;
};
