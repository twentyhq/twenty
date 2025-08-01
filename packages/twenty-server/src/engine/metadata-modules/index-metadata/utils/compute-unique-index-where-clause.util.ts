import { isDefined } from 'twenty-shared/utils';

import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

export const computeUniqueIndexWhereClause = (
  fieldMetadata: FieldMetadataEntity,
) => {
  const standardDefaultValue = generateDefaultValue(fieldMetadata.type);

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    const columnNamesWithDefaultValues: string[][] = [];

    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type,
    ) as CompositeType;

    const uniqueCompositeProperties = compositeType.properties.filter(
      (property) => property.isIncludedInUniqueConstraint,
    );

    uniqueCompositeProperties.forEach((property) => {
      if (
        standardDefaultValue &&
        typeof standardDefaultValue === 'object' &&
        property.name in standardDefaultValue
      ) {
        const defaultValue =
          standardDefaultValue[
            property.name as keyof typeof standardDefaultValue
          ];

        if (isDefined(defaultValue) && typeof defaultValue === 'string') {
          columnNamesWithDefaultValues.push([
            computeCompositeColumnName(fieldMetadata, property),
            defaultValue,
          ]);
        }
      }
    });

    return columnNamesWithDefaultValues.length > 0
      ? columnNamesWithDefaultValues
          .map(
            ([columnName, defaultValue]) =>
              `"${columnName}" != ${defaultValue}`,
          )
          .join(' OR ')
      : undefined;
  }

  return isDefined(standardDefaultValue)
    ? `"${fieldMetadata.name}" != ${standardDefaultValue}`
    : undefined;
};
