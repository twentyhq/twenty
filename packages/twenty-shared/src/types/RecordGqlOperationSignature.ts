import { type RecordGqlFields } from './RecordGqlFields';
import { type RecordGqlOperationVariables } from './RecordGqlOperationVariables';

export type RecordGqlOperationSignature = {
  objectNameSingular: string;
  variables: RecordGqlOperationVariables;
  fields?: RecordGqlFields;
};
