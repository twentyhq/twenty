import { FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/field-metadata/constants/field-metadata-standard-overrides-properties.constant';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { FlatFieldMetadataEditableProperties } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-editable-properties.constant';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

type SanitizeRawUpdateFieldInputArgs = {
  rawUpdateFieldInput: UpdateFieldInput;
  existingFlatFieldMetadata: FlatFieldMetadata;
};
export const sanitizeRawUpdateFieldInput = ({
  existingFlatFieldMetadata,
  rawUpdateFieldInput,
}: SanitizeRawUpdateFieldInputArgs) => {
  const isStandardField = isStandardMetadata(existingFlatFieldMetadata);
  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateFieldInput,
    [
      ...new Set([
        ...FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.standard,
        ...FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.custom,
      ]),
    ],
  );

  if (!isStandardField) {
    return {
      updatedEditableFieldProperties,
      standardOverrides: null,
    };
  }

  const invalidUpdatedProperties = Object.keys(
    updatedEditableFieldProperties,
  ).filter(
    (property: FlatFieldMetadataEditableProperties) =>
      !FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.standard.includes(
        property as (typeof FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.standard)[number],
      ),
  );

  if (invalidUpdatedProperties.length > 0) {
    throw new FieldMetadataException(
      `Cannot edit standard field metadata properties: ${invalidUpdatedProperties.join(', ')}`,
      FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
    );
  }

  const standardOverrides = FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES.reduce(
    (standardOverrides, property) => {
      const propertyValue = updatedEditableFieldProperties[property];

      const isPropertyUpdated =
        updatedEditableFieldProperties[property] !== undefined;

      if (!isPropertyUpdated) {
        return standardOverrides;
      }
      delete updatedEditableFieldProperties[property];

      if (propertyValue === existingFlatFieldMetadata[property]) {
        if (
          isDefined(standardOverrides) &&
          Object.prototype.hasOwnProperty.call(standardOverrides, property)
        ) {
          const { [property]: _, ...restOverrides } = standardOverrides;
          return restOverrides;
        }

        return standardOverrides;
      }

      return {
        ...standardOverrides,
        [property]: propertyValue,
      };
    },
    existingFlatFieldMetadata.standardOverrides,
  );

  if (
    isDefined(standardOverrides) &&
    Object.keys(standardOverrides).length === 0
  ) {
    return {
      standardOverrides: null,
      updatedEditableFieldProperties,
    };
  }

  return {
    standardOverrides,
    updatedEditableFieldProperties,
  };
};
