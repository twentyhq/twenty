import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import {
  fieldMetadataStandardOverridesProperties,
  type FieldMetadataStandardOverridesProperties,
} from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  flatFieldMetadataPropertiesToCompare,
  type FlatFieldMetadataPropertiesToCompare,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-with-field-id-only.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

const fieldMetadataEditableProperties =
  flatFieldMetadataPropertiesToCompare.filter(
    (
      property,
    ): property is Exclude<
      FlatFieldMetadataPropertiesToCompare,
      'standardOverrides'
    > => property !== 'standardOverrides',
  );

type FromUpdateFieldInputToFlatFieldMetadataToUpdateArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  updateFieldInput: UpdateFieldInput;
};
export const fromUpdateFieldInputToFlatFieldMetadataToUpdate = ({
  existingFlatObjectMetadataMaps,
  updateFieldInput: rawUpdateFieldInput,
}: FromUpdateFieldInputToFlatFieldMetadataToUpdateArgs): FieldInputTranspilationResult<FlatFieldMetadata> => {
  const updateFieldInputInformalProperties =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateFieldInput,
      ['objectMetadataId', 'id'],
    );
  const updatedEditableFields = extractAndSanitizeObjectStringFields(
    rawUpdateFieldInput,
    fieldMetadataEditableProperties,
  );

  const relatedFlatFieldMetadata =
    findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId({
      fieldMetadataId: updateFieldInputInformalProperties.id,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

  if (!isDefined(relatedFlatFieldMetadata)) {
    return {
      status: 'fail',
      error: new FieldMetadataException(
        'Field metadata to update not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      ),
    };
  }

  const flatObjectMetadataWithFlatFieldMaps =
    existingFlatObjectMetadataMaps.byId[
      relatedFlatFieldMetadata.objectMetadataId
    ];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    return {
      status: 'fail',
      error: new FieldMetadataException(
        'Field metadata to update object metadata not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      ),
    };
  }

  if (flatObjectMetadataWithFlatFieldMaps.isRemote) {
    return {
      status: 'fail',
      error: new ObjectMetadataException(
        'Remote objects are read-only',
        ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED,
      ),
    };
  }
  const isStandardField =
    relatedFlatFieldMetadata.standardId !== null &&
    !relatedFlatFieldMetadata.isCustom;

  if (isStandardField) {
    const invalidUpdatedProperties = Object.keys(updatedEditableFields).filter(
      (property) =>
        fieldMetadataStandardOverridesProperties.includes(
          property as FieldMetadataStandardOverridesProperties,
        ),
    );

    if (invalidUpdatedProperties.length > 0) {
      return {
        status: 'fail',
        error: new FieldMetadataException(
          `Cannot edit standard field metadata properties: ${invalidUpdatedProperties.join(', ')}`,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        ),
      };
    }

    const updatedStandardFlatFieldMetadata =
      fieldMetadataStandardOverridesProperties.reduce((acc, property) => {
        const isPropertyUpdated = updatedEditableFields[property] !== undefined;

        return {
          ...acc,
          standardOverrides: {
            ...acc.standardOverrides,
            ...(isPropertyUpdated
              ? { [property]: updatedEditableFields[property] }
              : {}),
          },
        };
      }, relatedFlatFieldMetadata);

    return {
      status: 'success',
      result: updatedStandardFlatFieldMetadata,
    };
  }

  const updatedFlatFieldMetadata = fieldMetadataEditableProperties.reduce(
    (acc, property) => {
      const isPropertyUpdated = updatedEditableFields[property] !== undefined;

      return {
        ...acc,
        ...(isPropertyUpdated
          ? { [property]: updatedEditableFields[property] }
          : {}),
      };
    },
    relatedFlatFieldMetadata,
  );

  return {
    status: 'success',
    result: updatedFlatFieldMetadata,
  };
};
