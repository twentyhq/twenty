import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FLAT_OBJECT_METADATA_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-properties-to-compare.constant';
import { type FlatObjectMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-properties-to-compare.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { recomputeIndexAfterFlatObjectMetadataSingularNameUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-index-after-flat-object-metadata-singular-name-update.util';
import { recomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-view-field-identifier-after-flat-object-identifier-update.util';
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
  updateObjectInput: UpdateOneObjectInput;
} & Pick<
  AllFlatEntityMaps,
  | 'flatIndexMaps'
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatViewFieldMaps'
  | 'flatViewMaps'
>;

const objectMetadataEditableProperties =
  FLAT_OBJECT_METADATA_PROPERTIES_TO_COMPARE.filter(
    (
      property,
    ): property is Exclude<
      FlatObjectMetadataPropertiesToCompare,
      'standardOverrides'
    > => property !== 'standardOverrides',
  );

type UpdatedFlatObjectAndRelatedFlatEntities = {
  flatObjectMetadata: FlatObjectMetadata;
  otherObjectFlatFieldMetadataToUpdate: FlatFieldMetadata[];
  flatIndexMetadataToUpdate: FlatIndexMetadata[];
  flatViewFieldToUpdate: FlatViewField[];
  flatViewFieldToCreate: FlatViewField[];
};

export const fromUpdateObjectInputToFlatObjectMetadataAndRelatedFlatEntities =
  ({
    flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    updateObjectInput: rawUpdateObjectInput,
    flatIndexMaps,
    flatFieldMetadataMaps,
    flatViewFieldMaps,
    flatViewMaps,
  }: FromUpdateObjectInputToFlatObjectMetadataArgs): UpdatedFlatObjectAndRelatedFlatEntities => {
    const { id: objectMetadataIdToUpdate } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        rawUpdateObjectInput,
        ['id'],
      );
    const updatedEditableObjectProperties =
      extractAndSanitizeObjectStringFields(
        rawUpdateObjectInput.update,
        objectMetadataEditableProperties,
      );

    const flatObjectMetadataToUpdate = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: existingFlatObjectMetadataMaps,
      flatEntityId: objectMetadataIdToUpdate,
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
        OBJECT_METADATA_STANDARD_OVERRIDES_PROPERTIES.reduce(
          (acc, property) => {
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
          },
          flatObjectMetadataToUpdate,
        );

      return {
        flatObjectMetadata: updatedStandardFlatObjectdMetadata,
        otherObjectFlatFieldMetadataToUpdate: [],
        flatIndexMetadataToUpdate: [],
        flatViewFieldToUpdate: [],
        flatViewFieldToCreate: [],
      };
    }

    const initialAccumulator: UpdatedFlatObjectAndRelatedFlatEntities = {
      flatObjectMetadata: flatObjectMetadataToUpdate,
      otherObjectFlatFieldMetadataToUpdate: [],
      flatIndexMetadataToUpdate: [],
      flatViewFieldToUpdate: [],
      flatViewFieldToCreate: [],
    };

    return objectMetadataEditableProperties.reduce<UpdatedFlatObjectAndRelatedFlatEntities>(
      (
        {
          flatObjectMetadata,
          otherObjectFlatFieldMetadataToUpdate,
          flatIndexMetadataToUpdate,
          flatViewFieldToUpdate,
          flatViewFieldToCreate,
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
            otherObjectFlatFieldMetadataToUpdate,
            flatIndexMetadataToUpdate,
            flatViewFieldToUpdate,
            flatViewFieldToCreate,
          };
        }

        const updatedFlatObjectMetadata = {
          ...flatObjectMetadata,
          [property]: updatedPropertyValue,
        };

        const newUpdatedOtherObjectFlatFieldMetadatas =
          property === 'nameSingular' || property === 'namePlural'
            ? renameRelatedMorphFieldOnObjectNamesUpdate({
                flatFieldMetadataMaps,
                fromFlatObjectMetadata: updatedFlatObjectMetadata,
                toFlatObjectMetadata: updatedFlatObjectMetadata,
              })
            : [];

        const newUpdatedFlatIndexMetadatas =
          property === 'nameSingular'
            ? recomputeIndexAfterFlatObjectMetadataSingularNameUpdate({
                flatFieldMetadataMaps,
                existingFlatObjectMetadata: flatObjectMetadataToUpdate,
                flatIndexMaps,
                updatedSingularName: updatedFlatObjectMetadata.nameSingular,
              })
            : [];

        const {
          flatViewFieldToCreate: newFlatViewFieldToCreate,
          flatViewFieldToUpdate: newFlatViewFieldToUpdate,
        } =
          property === 'labelIdentifierFieldMetadataId' &&
          isDefined(updatedFlatObjectMetadata.labelIdentifierFieldMetadataId)
            ? recomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdate({
                existingFlatObjectMetadata: flatObjectMetadataToUpdate,
                flatViewFieldMaps,
                flatViewMaps,
                updatedLabelIdentifierFieldMetadataId:
                  updatedFlatObjectMetadata.labelIdentifierFieldMetadataId,
              })
            : {
                flatViewFieldToCreate: [],
                flatViewFieldToUpdate: [],
              };

        return {
          flatObjectMetadata: updatedFlatObjectMetadata,
          otherObjectFlatFieldMetadataToUpdate: [
            ...otherObjectFlatFieldMetadataToUpdate,
            ...newUpdatedOtherObjectFlatFieldMetadatas,
          ],
          flatViewFieldToUpdate: [
            ...flatViewFieldToUpdate,
            ...newFlatViewFieldToUpdate,
          ],
          flatViewFieldToCreate: [
            ...flatViewFieldToCreate,
            ...newFlatViewFieldToCreate,
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
