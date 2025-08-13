import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type FlatObjectMetadataPropertiesToCompare,
  flatObjectMetadataPropertiesToCompare,
} from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import {
  type ObjectMetadataStandardOverridesProperties,
  objectMetadataStandardOverridesProperties,
} from 'src/engine/metadata-modules/object-metadata/dtos/object-standard-overrides.dto';
import { type UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

type FromUpdateObjectInputToFlatObjectMetadataArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  updateObjectInput: UpdateOneObjectInput;
};

const objectMetadataEditableProperties =
  flatObjectMetadataPropertiesToCompare.filter(
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

  const isStandardObject =
    flatObjectMetadataToUpdate.standardId !== null &&
    !flatObjectMetadataToUpdate.isCustom;

  if (isStandardObject) {
    const invalidUpdatedProperties = Object.keys(
      updatedEditableObjectProperties,
    ).filter(
      (property) =>
        !objectMetadataStandardOverridesProperties.includes(
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
      objectMetadataStandardOverridesProperties.reduce((acc, property) => {
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
