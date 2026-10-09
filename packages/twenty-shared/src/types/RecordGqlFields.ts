export type RecordGqlFields = {
  [fieldName: string]: true | RecordGqlFields;
};
