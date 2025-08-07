import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

export const computeUniqueIndexWhereClause = (
  fieldMetadata: FieldMetadataEntity,
) => {
  const standardDefaultValue = generateDefaultValue(fieldMetadata.type);

  if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
    return isDefined(standardDefaultValue)
      ? `"${fieldMetadata.name}" != ${standardDefaultValue}`
      : undefined;
  }

  if (
    !isDefined(standardDefaultValue) ||
    typeof standardDefaultValue !== 'object'
  ) {
    return;
  }

  const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

  if (!isDefined(compositeType)) {
    throw new FieldMetadataException(
      `Composite type not found for field metadata type: ${fieldMetadata.type}`,
      FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
    );
  }

  const columnNamesWithDefaultValues = compositeType.properties
    .filter(
      (property) =>
        property.isIncludedInUniqueConstraint &&
        property.name in standardDefaultValue,
    )
    .map((property) => {
      const defaultValue =
        standardDefaultValue[
          property.name as keyof typeof standardDefaultValue
        ];

      if (isDefined(defaultValue) && typeof defaultValue === 'string') {
        return [
          computeCompositeColumnName(fieldMetadata, property),
          defaultValue,
        ];
      }
    })
    .filter(isDefined);

  return columnNamesWithDefaultValues.length > 0
    ? columnNamesWithDefaultValues
        .map(
          ([columnName, defaultValue]) => `"${columnName}" != ${defaultValue}`,
        )
        .join(' OR ')
    : undefined;
};
