import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { FLAT_OBJECT_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-properties-to-compare.constant';
import { type FlatObjectMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-properties-to-compare.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { recomputeIndexAfterFlatObjectMetadataSingularNameUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-index-after-flat-object-metadata-singular-name-update.util';
import { renameRelatedMorphFieldOnObjectNamesUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/rename-related-morph-field-on-object-names-update.util';
import { OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata-standard-overrides-properties.constant';
import { type UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type ObjectMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-standard-overrides-properties.types';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';

type FromUpdateObjectInputToFlatObjectMetadataArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  updateObjectInput: UpdateOneObjectInput;
} & Pick<AllFlatEntityMaps, 'flatIndexMaps'>;

const objectMetadataEditableProperties =
  FLAT_OBJECT_METADATA_PROPERTIES_TO_COMPARE.filter(
    (
      property,
    ): property is Exclude<
      FlatObjectMetadataPropertiesToCompare,
      'standardOverrides'
    > => property !== 'standardOverrides',
  );

type UpdatedFlatObjectAndOtherObjectFieldMetadatas = {
  flatObjectMetadata: FlatObjectMetadata;
  otherObjectFlatFieldMetadataToUpdate: FlatFieldMetadata[];
  flatIndexMetadataToUpdate: FlatIndexMetadata[];
};

export const fromUpdateObjectInputToFlatObjectMetadata = ({
  existingFlatObjectMetadataMaps,
  updateObjectInput: rawUpdateObjectInput,
  flatIndexMaps,
}: FromUpdateObjectInputToFlatObjectMetadataArgs): UpdatedFlatObjectAndOtherObjectFieldMetadatas => {
  const { id: objectMetadataIdToUpdate } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateObjectInput,
      ['id'],
    );
  const updatedEditableObjectProperties = extractAndSanitizeObjectStringFields(
    rawUpdateObjectInput.update,
    objectMetadataEditableProperties,
  );

  const flatObjectMetadataToUpdate =
    findFlatObjectMetadataInFlatObjectMetadataMaps({
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      objectMetadataId: objectMetadataIdToUpdate,
    });

  if (!isDefined(flatObjectMetadataToUpdate)) {
    throw new ObjectMetadataException(
      'Object to update not found',
      ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  if (isStandardMetadata(flatObjectMetadataToUpdate)) {
    const invalidUpdatedProperties = Object.keys(
      updatedEditableObjectProperties,
    ).filter(
      (property) =>
        !OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES.includes(
          property as ObjectMetadataStandardOverridesProperties,
        ),
    );

    if (invalidUpdatedProperties.length > 0) {
      throw new ObjectMetadataException(
        `Cannot edit standard object metadata properties: ${invalidUpdatedProperties.join(', ')}`,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }

    const updatedStandardFlatObjectdMetadata =
      OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES.reduce((acc, property) => {
        const isPropertyUpdated =
          updatedEditableObjectProperties[property] !== undefined;

        return {
          ...acc,
          standardOverrides: {
            ...acc.standardOverrides,
            ...(isPropertyUpdated
              ? { [property]: updatedEditableObjectProperties[property] }
              : {}),
          },
        };
      }, flatObjectMetadataToUpdate);

    return {
      flatObjectMetadata: updatedStandardFlatObjectdMetadata,
      otherObjectFlatFieldMetadataToUpdate: [],
      flatIndexMetadataToUpdate: [],
    };
  }

  const initialAccumulator: UpdatedFlatObjectAndOtherObjectFieldMetadatas = {
    flatObjectMetadata: flatObjectMetadataToUpdate,
    otherObjectFlatFieldMetadataToUpdate: [],
    flatIndexMetadataToUpdate: [],
  };

  return objectMetadataEditableProperties.reduce<UpdatedFlatObjectAndOtherObjectFieldMetadatas>(
    (
      {
        flatObjectMetadata,
        otherObjectFlatFieldMetadataToUpdate: otherObjectFlatFieldMetadatas,
        flatIndexMetadataToUpdate,
      },
      property,
    ) => {
      const updatedPropertyValue = updatedEditableObjectProperties[property];
      const isPropertyUpdated =
        updatedPropertyValue !== undefined &&
        flatObjectMetadata[property] !== updatedPropertyValue;

      if (!isPropertyUpdated) {
        return {
          flatObjectMetadata,
          otherObjectFlatFieldMetadataToUpdate: otherObjectFlatFieldMetadatas,
          flatIndexMetadataToUpdate,
        };
      }

      const updatedFlatObjectMetadata = {
        ...flatObjectMetadata,
        [property]: updatedPropertyValue,
      };

      // This should also return index for field that has been updated
      // Wil handle once we do that for fields too
      const newUpdatedOtherObjectFlatFieldMetadatas =
        property === 'nameSingular' || property === 'namePlural'
          ? renameRelatedMorphFieldOnObjectNamesUpdate({
              existingFlatObjectMetadataMaps,
              fromFlatObjectMetadata: updatedFlatObjectMetadata,
              toFlatObjectMetadata: updatedFlatObjectMetadata,
            })
          : [];

      const newUpdatedFlatIndexMetadatas =
        property === 'nameSingular'
          ? recomputeIndexAfterFlatObjectMetadataSingularNameUpdate({
              existingFlatObjectMetadata: flatObjectMetadataToUpdate,
              flatIndexMaps,
              updatedSingularName: updatedFlatObjectMetadata.nameSingular,
            })
          : [];

      return {
        flatObjectMetadata: updatedFlatObjectMetadata,
        otherObjectFlatFieldMetadataToUpdate: [
          ...otherObjectFlatFieldMetadatas,
          ...newUpdatedOtherObjectFlatFieldMetadatas,
        ],
        flatIndexMetadataToUpdate: [
          ...flatIndexMetadataToUpdate,
          ...newUpdatedFlatIndexMetadatas,
        ],
      };
    },
    initialAccumulator,
  );
};
