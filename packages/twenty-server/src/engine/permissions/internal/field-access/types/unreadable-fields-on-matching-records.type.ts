import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type UnreadableFieldsOnMatchingRecords = {
  fieldMetadataIds: string[];
  recordFilter: RecordGqlOperationFilter;
};
