import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type InaccessibleFieldsOnMatchingRecords = {
  fieldMetadataIds: string[];
  recordFilter: RecordGqlOperationFilter;
};
