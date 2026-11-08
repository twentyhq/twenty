import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type UnreadableFieldsWithRecordFilter = {
  recordFilter: RecordGqlOperationFilter;
  unreadableFieldMetadataIds: string[];
};
