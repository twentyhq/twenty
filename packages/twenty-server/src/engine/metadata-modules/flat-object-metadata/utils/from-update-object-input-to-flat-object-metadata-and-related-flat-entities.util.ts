import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_OBJECT_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-object-metadata/constants/flat-object-metadata-editable-properties.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
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
>;

export const fromUpdateObjectInputToFlatObjectMetadataAndRelatedFlatEntities =
  ({
    flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    updateObjectInput: rawUpdateObjectInput,
    flatIndexMaps,
    flatFieldMetadataMaps,
    flatViewFieldMaps,
    flatViewMaps,
  }: FromUpdateObjectInputToFlatObjectMetadataArgs): FlatObjectMetadataUpdateSideEffects & {
    flatObjectMetadataToUpdate: FlatObjectMetadata;
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

    const isStandardObject = isStandardMetadata(existingFlatObjectMetadata);
    const { standardOverrides, updatedEditableObjectProperties } =
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
      standardOverrides,
    };

    const {
      flatIndexMetadatasToUpdate,
      flatViewFieldsToCreate,
      flatViewFieldsToUpdate,
      otherObjectFlatFieldMetadatasToUpdate,
      sameObjectFlatFieldMetadatasToUpdate,
    } = handleFlatObjectMetadataUpdateSideEffect({
      fromFlatObjectMetadata: existingFlatObjectMetadata,
      toFlatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatIndexMaps,
      flatViewFieldMaps,
      flatViewMaps,
    });

    return {
      flatIndexMetadatasToUpdate,
      flatObjectMetadataToUpdate: toFlatObjectMetadata,
      flatViewFieldsToCreate,
      flatViewFieldsToUpdate,
      otherObjectFlatFieldMetadatasToUpdate,
      sameObjectFlatFieldMetadatasToUpdate,
    };
  };
