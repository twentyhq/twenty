import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { FLAT_OBJECT_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-properties-to-compare.constant';
import { type FlatObjectMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-properties-to-compare.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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
};

const objectMetadataEditableProperties =
  FLAT_OBJECT_METADATA_PROPERTIES_TO_COMPARE.filter(
    (
      property,
    ): property is Exclude<
      FlatObjectMetadataPropertiesToCompare,
      'standardOverrides'
    > => property !== 'standardOverrides',
  );

export const fromUpdateObjectInputToFlatObjectMetadata = ({
  existingFlatObjectMetadataMaps,
  updateObjectInput: rawUpdateObjectInput,
}: FromUpdateObjectInputToFlatObjectMetadataArgs): FlatObjectMetadata => {
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

    return updatedStandardFlatObjectdMetadata;
  }

  const updatedFlatObjectMetadata = objectMetadataEditableProperties.reduce(
    (acc, property) => {
      const isPropertyUpdated =
        updatedEditableObjectProperties[property] !== undefined;

      return {
        ...acc,
        ...(isPropertyUpdated
          ? { [property]: updatedEditableObjectProperties[property] }
          : {}),
      };
    },
    flatObjectMetadataToUpdate,
  );

  return updatedFlatObjectMetadata;
};
