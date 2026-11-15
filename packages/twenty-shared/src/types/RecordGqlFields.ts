import { type RecordGqlFieldsRelationWithArguments } from './RecordGqlFieldsRelationWithArguments';

export type RecordGqlFields = {
  [responseKey: string]:
    | true
    | RecordGqlFields
    | RecordGqlFieldsRelationWithArguments;
};
