import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type RlsRuleUnreadableFields = {
  recordFilter: RecordGqlOperationFilter;
  unreadableFieldMetadataIds: string[];
};
