import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-editable-properties.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata-standard-overrides-properties.constant';
import { type UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type ObjectMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-standard-overrides-properties.types';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';

type SanitizeRawUpdateObjectInputArgs = {
  rawUpdateObjectInput: UpdateOneObjectInput;
  existingFlatObjectMetadata: FlatObjectMetadata;
};

export const sanitizeRawUpdateObjectInput = ({
  existingFlatObjectMetadata,
  rawUpdateObjectInput,
}: SanitizeRawUpdateObjectInputArgs) => {
  const isStandardObject = isStandardMetadata(existingFlatObjectMetadata);
  const updatedEditableObjectProperties = extractAndSanitizeObjectStringFields(
    rawUpdateObjectInput.update,
    [
      ...new Set([
        ...FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard,
        ...FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.custom,
      ]),
    ],
  );

  if (!isStandardObject) {
    return {
      updatedEditableObjectProperties,
      standardOverrides: null,
    };
  }

  const invalidUpdatedProperties = Object.keys(
    updatedEditableObjectProperties,
  ).filter(
    (property) =>
      !FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES.standard.includes(
        property as ObjectMetadataStandardOverridesProperties,
      ),
  );

  if (invalidUpdatedProperties.length > 0) {
    throw new ObjectMetadataException(
      `Cannot edit standard object metadata properties: ${invalidUpdatedProperties.join(', ')}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }

  const standardOverrides =
    OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES.reduce(
      (standardOverrides, property) => {
        const propertyValue = updatedEditableObjectProperties[property];

        const isPropertyUpdated =
          updatedEditableObjectProperties[property] !== undefined;

        if (!isPropertyUpdated) {
          return standardOverrides;
        }
        delete updatedEditableObjectProperties[property];

        if (propertyValue === existingFlatObjectMetadata[property]) {
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
      existingFlatObjectMetadata.standardOverrides,
    );

  if (
    isDefined(standardOverrides) &&
    Object.keys(standardOverrides).length === 0
  ) {
    return {
      standardOverrides: null,
      updatedEditableObjectProperties,
    };
  }

  return {
    standardOverrides,
    updatedEditableObjectProperties,
  };
};
