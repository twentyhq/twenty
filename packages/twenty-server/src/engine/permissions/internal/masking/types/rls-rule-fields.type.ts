import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type RlsRuleFields = {
  roleId: string;
  fieldMetadataIds: string[];
  recordFilter: RecordGqlOperationFilter | null;
};
