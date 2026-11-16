import {
  compositeTypeDefinitions,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { ComputedFieldExpressionError, isDefined } from 'twenty-shared/utils';

import { type ComputedFieldPathResolution } from 'src/engine/metadata-modules/computed-field/types/computed-field-path-resolution.type';
import { type ComputedFieldSchemaField } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-field.type';
import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';

const MAX_TO_ONE_RELATION_HOPS = 3;

export const resolveComputedFieldPathOrThrow = <
  TObject,
  TField extends ComputedFieldSchemaField,
>({
  path,
  object,
  schemaReader,
}: {
  path: string[];
  object: TObject;
  schemaReader: ComputedFieldSchemaReader<TObject, TField>;
}): ComputedFieldPathResolution<TObject, TField> => {
  const readablePath = path.join('.');
  const [fieldName, ...remainingPath] = path;

  const field = schemaReader.findFieldByName(object, fieldName);

  if (!isDefined(field)) {
    throw new ComputedFieldExpressionError(
      `"${fieldName}" is not a field of ${schemaReader.getObjectName(object)}`,
    );
  }

  if (isMorphOrRelationFieldMetadataType(field.type)) {
    const targetObject = schemaReader.findRelationTargetObject(field);

    if (
      field.type !== FieldMetadataType.RELATION ||
      schemaReader.getRelationType(field) !== RelationType.MANY_TO_ONE ||
      !isDefined(targetObject)
    ) {
      throw new ComputedFieldExpressionError(
        `"${fieldName}" links to several records or objects; only a relation to one record can be read`,
      );
    }

    if (remainingPath.length === 0) {
      throw new ComputedFieldExpressionError(
        `"${readablePath}" is a relation; read one of its fields, such as "${readablePath}.id"`,
      );
    }

    const targetResolution = resolveComputedFieldPathOrThrow({
      path: remainingPath,
      object: targetObject,
      schemaReader,
    });

    if (targetResolution.toOneRelationHops.length >= MAX_TO_ONE_RELATION_HOPS) {
      throw new ComputedFieldExpressionError(
        `"${readablePath}" follows more than ${MAX_TO_ONE_RELATION_HOPS} relations`,
      );
    }

    return {
      ...targetResolution,
      toOneRelationHops: [
        {
          relationField: field,
          joinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: fieldName,
          }),
          targetObject,
        },
        ...targetResolution.toOneRelationHops,
      ],
    };
  }

  if (isCompositeFieldMetadataType(field.type)) {
    const [subFieldName, ...pathAfterSubField] = remainingPath;
    const compositeProperty = compositeTypeDefinitions
      .get(field.type)
      ?.properties.find((property) => property.name === subFieldName);

    if (!isDefined(compositeProperty) || pathAfterSubField.length > 0) {
      throw new ComputedFieldExpressionError(
        `"${readablePath}" must name one sub-field of "${fieldName}"`,
      );
    }

    return {
      toOneRelationHops: [],
      field,
      columnName: computeCompositeColumnName(fieldName, compositeProperty),
      columnType: compositeProperty.type,
    };
  }

  if (remainingPath.length > 0) {
    throw new ComputedFieldExpressionError(
      `"${readablePath}" reads past the field "${fieldName}"`,
    );
  }

  return {
    toOneRelationHops: [],
    field,
    columnName: fieldName,
    columnType: field.type,
  };
};
