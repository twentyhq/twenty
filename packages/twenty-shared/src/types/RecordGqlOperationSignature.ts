import { type RecordGqlOperationGqlRecordFields } from './RecordGqlOperationGqlRecordFields';
import { type RecordGqlOperationVariables } from './RecordGqlOperationVariables';

export type RecordGqlOperationSignature = {
  objectNameSingular: string;
  variables: RecordGqlOperationVariables;
  fields?: RecordGqlOperationGqlRecordFields;
};
