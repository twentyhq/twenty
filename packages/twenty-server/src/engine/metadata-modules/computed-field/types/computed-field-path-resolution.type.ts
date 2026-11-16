import { type FieldMetadataType } from 'twenty-shared/types';

export type ComputedFieldToOneRelationHop<TObject, TField> = {
  relationField: TField;
  joinColumnName: string;
  targetObject: TObject;
};

export type ComputedFieldPathResolution<TObject, TField> = {
  toOneRelationHops: ComputedFieldToOneRelationHop<TObject, TField>[];
  field: TField;
  columnName: string;
  columnType: FieldMetadataType;
};
