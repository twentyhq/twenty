import { type RecordGqlFields } from './RecordGqlFields';
import { type RecordGqlOperationFilter } from './RecordGqlOperationFilter';
import { type RecordGqlOperationOrderBy } from './RecordGqlOperationOrderBy';

// Keyed in RecordGqlFields by computeRelationWithArgumentsResponseKey, so the same field and arguments always land on the same record key
export type RecordGqlFieldsRelationWithArguments = {
  relationFieldName: string;
  filter?: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  first?: number;
  aggregateGqlFieldNames?: string[];
  recordGqlFields: RecordGqlFields;
};
