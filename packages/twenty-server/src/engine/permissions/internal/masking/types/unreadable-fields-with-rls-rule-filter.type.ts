import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type UnreadableFieldsWithRlsRuleFilter = {
  rlsRuleFilter: RecordGqlOperationFilter;
  fieldMetadataIds: string[];
};
