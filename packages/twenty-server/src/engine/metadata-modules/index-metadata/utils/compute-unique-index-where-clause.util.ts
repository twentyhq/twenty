import { isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import {
  IndexMetadataException,
  IndexMetadataExceptionCode,
} from 'src/engine/metadata-modules/index-metadata/index-field-metadata.exception';

//TODO : To delete once IS_NULL_EQUIVALENCE_ENABLED feature flag removed
export const computeUniqueIndexWhereClause = (
  fieldMetadata: Pick<FieldMetadataEntity, 'type' | 'name' | 'defaultValue'>,
) => {
  const defaultValue = fieldMetadata.defaultValue;

  if (!isDefined(defaultValue)) return;

  if (
    fieldMetadata.type === FieldMetadataType.RELATION ||
    fieldMetadata.type === FieldMetadataType.MORPH_RELATION
  ) {
    throw new IndexMetadataException(
      `Unique index cannot be created for relation or morph relation field ${fieldMetadata.name}`,
      IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_MORH_RELATION_FIELD_AND_RELATION_FIELD,
    );
  }

  if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
    return `"${fieldMetadata.name}" != ${defaultValue}`;
  }

  const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

  if (!isDefined(compositeType)) {
    throw new FieldMetadataException(
      `Composite type not found for field metadata type: ${fieldMetadata.type}`,
      FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
    );
  }

  const defaultDefaultValueProperties = Object.keys(defaultValue);

  const columnNamesWithDefaultValues = compositeType.properties
    .filter(
      (property) =>
        property.isIncludedInUniqueConstraint &&
        defaultDefaultValueProperties.includes(property.name),
    )
    .map((property) => {
      const defaultValueProperty =
        defaultValue[property.name as keyof typeof defaultValue];

      if (isNonEmptyString(defaultValueProperty)) {
        return [
          computeCompositeColumnName(fieldMetadata, property),
          defaultValueProperty,
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
