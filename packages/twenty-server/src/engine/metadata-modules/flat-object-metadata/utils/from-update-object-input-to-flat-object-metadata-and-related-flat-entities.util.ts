import {
  isDefined,
  isImageIdentifierFieldMetadataType,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-editable-properties.constant';
import {
  type FlatObjectMetadataUpdateSideEffects,
  handleFlatObjectMetadataUpdateSideEffect,
} from 'src/engine/metadata-modules/flat-object-metadata/utils/handle-flat-object-metadata-update-side-effect.util';
import { sanitizeRawUpdateObjectInput } from 'src/engine/metadata-modules/flat-object-metadata/utils/sanitize-raw-update-object-input';
import { type UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

type FromUpdateObjectInputToFlatObjectMetadataArgs = {
  updateObjectInput: UpdateOneObjectInput;
} & Pick<
  AllFlatEntityMaps,
  | 'flatIndexMaps'
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatViewFieldMaps'
  | 'flatViewMaps'
  | 'flatSearchFieldMetadataMaps'
>;

export const fromUpdateObjectInputToFlatObjectMetadataAndRelatedFlatEntities =
  ({
    flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    updateObjectInput: rawUpdateObjectInput,
    flatIndexMaps,
    flatFieldMetadataMaps,
    flatViewFieldMaps,
    flatViewMaps,
    flatSearchFieldMetadataMaps,
  }: FromUpdateObjectInputToFlatObjectMetadataArgs): FlatObjectMetadataUpdateSideEffects & {
    flatObjectMetadataToUpdate: UniversalFlatObjectMetadata;
  } => {
    const { id: objectMetadataIdToUpdate } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        rawUpdateObjectInput,
        ['id'],
      );

    const existingFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: existingFlatObjectMetadataMaps,
      flatEntityId: objectMetadataIdToUpdate,
    });

    if (!isDefined(existingFlatObjectMetadata)) {
      throw new ObjectMetadataException(
        'Object to update not found',
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const requestedImageIdentifierFieldMetadataId =
      rawUpdateObjectInput.update.imageIdentifierFieldMetadataId;

    if (isDefined(requestedImageIdentifierFieldMetadataId)) {
      const imageIdentifierFlatFieldMetadata =
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatFieldMetadataMaps,
          flatEntityId: requestedImageIdentifierFieldMetadataId,
        });

      if (!isDefined(imageIdentifierFlatFieldMetadata)) {
        throw new ObjectMetadataException(
          'Field declared as image identifier not found',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        );
      }

      if (
        imageIdentifierFlatFieldMetadata.objectMetadataId !==
        existingFlatObjectMetadata.id
      ) {
        throw new ObjectMetadataException(
          'Field declared as image identifier does not belong to this object',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        );
      }

      if (
        !isImageIdentifierFieldMetadataType(
          imageIdentifierFlatFieldMetadata.type,
        )
      ) {
        throw new ObjectMetadataException(
          'Field cannot be used as image identifier due to its type: should be of type Files or Links',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        );
      }

      if (!imageIdentifierFlatFieldMetadata.isActive) {
        throw new ObjectMetadataException(
          'Field cannot be used as image identifier because it is deactivated',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        );
      }
    }

    const isStandardObject = belongsToTwentyStandardApp(
      existingFlatObjectMetadata,
    );
    const { overrides, updatedEditableObjectProperties } =
      sanitizeRawUpdateObjectInput({
        existingFlatObjectMetadata,
        rawUpdateObjectInput,
      });

    const toFlatObjectMetadata = {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatObjectMetadata,
        properties:
          FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES[
            isStandardObject ? 'standard' : 'custom'
          ],
        update: updatedEditableObjectProperties,
      }),
      overrides,
    };

    if (
      isDefined(updatedEditableObjectProperties.labelIdentifierFieldMetadataId)
    ) {
      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId:
          updatedEditableObjectProperties.labelIdentifierFieldMetadataId,
      });

      toFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier =
        flatFieldMetadata?.universalIdentifier;
    }

    if ('imageIdentifierFieldMetadataId' in updatedEditableObjectProperties) {
      const { imageIdentifierFieldMetadataId } =
        updatedEditableObjectProperties;

      toFlatObjectMetadata.imageIdentifierFieldMetadataUniversalIdentifier =
        isDefined(imageIdentifierFieldMetadataId)
          ? findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityMaps: flatFieldMetadataMaps,
              flatEntityId: imageIdentifierFieldMetadataId,
            }).universalIdentifier
          : null;
    }

    const {
      flatIndexMetadatasToUpdate,
      flatViewFieldsToCreate,
      flatViewFieldsToUpdate,
      otherObjectFlatFieldMetadatasToUpdate,
      searchFieldMetadatasToCreate,
    } = handleFlatObjectMetadataUpdateSideEffect({
      fromFlatObjectMetadata: existingFlatObjectMetadata,
      toFlatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatIndexMaps,
      flatViewFieldMaps,
      flatViewMaps,
      flatSearchFieldMetadataMaps,
    });

    return {
      flatIndexMetadatasToUpdate,
      flatObjectMetadataToUpdate: toFlatObjectMetadata,
      flatViewFieldsToCreate,
      flatViewFieldsToUpdate,
      otherObjectFlatFieldMetadatasToUpdate,
      searchFieldMetadatasToCreate,
    };
  };
