import { type ComputedFieldSchemaField } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-field.type';
import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

// How an expression's field names are looked up: by id at query time, by universal identifier when metadata is validated
export type ComputedFieldSchemaReader<
  TObject,
  TField extends ComputedFieldSchemaField,
> = {
  getObjectName: (object: TObject) => string;
  findFieldByName: (object: TObject, fieldName: string) => TField | undefined;
  getRelationType: (relationField: TField) => RelationType | undefined;
  findRelationTargetObject: (relationField: TField) => TObject | undefined;
  findRelationInverseField: (relationField: TField) => TField | undefined;
};
