import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/field-metadata/constants/field-metadata-standard-overrides-properties.constant';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FieldMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/field-metadata/types/field-metadata-standard-overrides-properties.type';
import { FLAT_FIELD_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-properties-to-compare.constant';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {} from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-with-field-id-only.util';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';

const fieldMetadataEditableProperties =
  FLAT_FIELD_METADATA_PROPERTIES_TO_COMPARE.filter(
    (
      property,
    ): property is Exclude<
      FlatFieldMetadataPropertiesToCompare,
      'standardOverrides'
    > => property !== 'standardOverrides',
  );

type FromUpdateFieldInputToFlatFieldMetadataArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  updateFieldInput: UpdateFieldInput;
};
export const fromUpdateFieldInputToFlatFieldMetadata = ({
  existingFlatObjectMetadataMaps,
  updateFieldInput: rawUpdateFieldInput,
}: FromUpdateFieldInputToFlatFieldMetadataArgs): FieldInputTranspilationResult<FlatFieldMetadata> => {
  const updateFieldInputInformalProperties =
    extractAndSanitizeObjectStringFields(rawUpdateFieldInput, [
      'objectMetadataId',
      'id',
    ]);
  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
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
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'Field metadata to update not found',
        userFriendlyMessage: t`Field metadata to update not found`,
      },
    };
  }

  const flatObjectMetadataWithFlatFieldMaps =
    existingFlatObjectMetadataMaps.byId[
      relatedFlatFieldMetadata.objectMetadataId
    ];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'Field metadata to update object metadata not found',
        userFriendlyMessage: t`Field metadata to update object metadata not found`,
      },
    };
  }

  if (flatObjectMetadataWithFlatFieldMaps.isRemote) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: 'Remote objects are read-only',
      },
    };
  }

  if (isStandardMetadata(relatedFlatFieldMetadata)) {
    const invalidUpdatedProperties = Object.keys(
      updatedEditableFieldProperties,
    ).filter((property) =>
      FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES.includes(
        property as FieldMetadataStandardOverridesProperties,
      ),
    );

    if (invalidUpdatedProperties.length > 0) {
      const invalidProperties = invalidUpdatedProperties.join(', ');
      return {
        status: 'fail',
        error: {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Cannot update standard field metadata properties: ${invalidProperties}`,
          userFriendlyMessage: t`Cannot update standard field properties: ${invalidProperties}`,
        },
      };
    }

    const updatedStandardFlatFieldMetadata =
      FIELD_METADATA_STANDARD_OVERRIDES_PROPERTIES.reduce((acc, property) => {
        const isPropertyUpdated =
          updatedEditableFieldProperties[property] !== undefined;

        return {
          ...acc,
          standardOverrides: {
            ...acc.standardOverrides,
            ...(isPropertyUpdated
              ? { [property]: updatedEditableFieldProperties[property] }
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
      let newValue = updatedEditableFieldProperties[property];

      if (property === 'options' && isDefined(newValue)) {
        newValue = updatedEditableFieldProperties[property]?.map((option) => ({
          id: v4(),
          ...option,
        }));
      }

      return {
        ...acc,
        ...(newValue !== undefined ? { [property]: newValue } : {}),
      };
    },
    relatedFlatFieldMetadata,
  );

  return {
    status: 'success',
    result: updatedFlatFieldMetadata,
  };
};
