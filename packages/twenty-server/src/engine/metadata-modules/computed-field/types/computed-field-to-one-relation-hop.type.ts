export type ComputedFieldToOneRelationHop<TObject, TField> = {
  relationField: TField;
  joinColumnName: string;
  targetObject: TObject;
};
