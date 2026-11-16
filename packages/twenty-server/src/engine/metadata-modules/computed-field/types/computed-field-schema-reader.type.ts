import { type FieldMetadataType } from 'twenty-shared/types';

import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

export type ComputedFieldSchemaField = {
  name: string;
  type: FieldMetadataType;
  computation?: unknown;
};

// How an expression's field names are looked up: by id at query time, by universal identifier when metadata is validated
export type ComputedFieldSchemaReader<
  TObject,
  TField extends ComputedFieldSchemaField,
> = {
  getObjectName: (object: TObject) => string;
  findFieldByName: (object: TObject, fieldName: string) => TField | undefined;
  findToOneRelationFieldByJoinColumnName: (
    object: TObject,
    joinColumnName: string,
  ) => TField | undefined;
  getRelationType: (relationField: TField) => RelationType | undefined;
  findRelationTargetObject: (relationField: TField) => TObject | undefined;
  findRelationInverseField: (relationField: TField) => TField | undefined;
};
