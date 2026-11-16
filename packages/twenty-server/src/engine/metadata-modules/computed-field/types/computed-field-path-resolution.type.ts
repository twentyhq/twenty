import { type FieldMetadataType } from 'twenty-shared/types';

export type ComputedFieldToOneRelationHop<TObject> = {
  joinColumnName: string;
  targetObject: TObject;
};

// Where a path such as "task.assignee.name" lands: the to-one relations it follows, then a column
export type ComputedFieldPathResolution<TObject, TField> = {
  toOneRelationHops: ComputedFieldToOneRelationHop<TObject>[];
  field: TField;
  columnName: string;
  columnType: FieldMetadataType;
};
