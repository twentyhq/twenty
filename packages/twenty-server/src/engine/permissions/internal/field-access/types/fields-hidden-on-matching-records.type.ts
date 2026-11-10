import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type FieldsHiddenOnMatchingRecords = {
  fieldMetadataIds: string[];
  recordFilter: RecordGqlOperationFilter;
};
