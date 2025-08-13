import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  FlatObjectMetadataPropertiesToCompare,
  flatObjectMetadataPropertiesToCompare,
} from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import {
  ObjectMetadataStandardOverridesProperties,
  objectMetadataStandardOverridesProperties,
} from 'src/engine/metadata-modules/object-metadata/dtos/object-standard-overrides.dto';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

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

  const isStandardField =
    flatObjectMetadataToUpdate.standardId !== null &&
    !flatObjectMetadataToUpdate.isCustom;

  if (isStandardField) {
    const invalidUpdatedProperties = Object.keys(
      updatedEditableObjectProperties,
    ).filter((property) =>
      objectMetadataStandardOverridesProperties.includes(
        property as ObjectMetadataStandardOverridesProperties,
      ),
    );

    if (invalidUpdatedProperties.length > 0) {
      throw new ObjectMetadataException(
        `Cannot edit standard object metadata properties: ${invalidUpdatedProperties.join(', ')}`,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }

    const updatedStandardFlatFieldMetadata =
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

    return updatedStandardFlatFieldMetadata;
  }

  const updatedFlatFieldMetadata = objectMetadataEditableProperties.reduce(
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

  return updatedFlatFieldMetadata;
};
