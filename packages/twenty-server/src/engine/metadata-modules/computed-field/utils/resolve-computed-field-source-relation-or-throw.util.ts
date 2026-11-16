import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isComputedField, isDefined } from 'twenty-shared/utils';

import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import {
  type ComputedFieldSchemaField,
  type ComputedFieldSchemaReader,
} from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';

export const resolveComputedFieldSourceRelationOrThrow = <
  TObject,
  TField extends ComputedFieldSchemaField,
>({
  relationFieldName,
  object,
  schemaReader,
}: {
  relationFieldName: string;
  object: TObject;
  schemaReader: ComputedFieldSchemaReader<TObject, TField>;
}): {
  relationField: TField;
  relatedObject: TObject;
  relatedRecordJoinColumnName: string;
} => {
  const relationField = schemaReader.findFieldByName(object, relationFieldName);

  const isStoredOneToManyRelation =
    isDefined(relationField) &&
    relationField.type === FieldMetadataType.RELATION &&
    schemaReader.getRelationType(relationField) === RelationType.ONE_TO_MANY &&
    !isComputedField(relationField);

  const relatedObject = isStoredOneToManyRelation
    ? schemaReader.findRelationTargetObject(relationField)
    : undefined;
  const inverseField = isStoredOneToManyRelation
    ? schemaReader.findRelationInverseField(relationField)
    : undefined;

  if (
    !isDefined(relationField) ||
    !isDefined(relatedObject) ||
    !isDefined(inverseField)
  ) {
    throw new ComputedFieldExpressionException(
      `"${relationFieldName}" must be a stored one-to-many relation of ${schemaReader.getObjectName(object)}`,
    );
  }

  return {
    relationField,
    relatedObject,
    relatedRecordJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
      name: inverseField.name,
    }),
  };
};
