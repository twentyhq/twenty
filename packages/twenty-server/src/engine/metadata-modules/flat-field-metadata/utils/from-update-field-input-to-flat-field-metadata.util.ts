import { msg } from '@lingui/core/macro';
import { type RelationUpdatePayload } from 'twenty-shared/types';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldMetadataRelatedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-related-flat-field-metadata.util';
import {
  FLAT_FIELD_METADATA_UPDATE_EMPTY_SIDE_EFFECTS,
  type FlatFieldMetadataUpdateSideEffects,
  handleFlatFieldMetadataUpdateSideEffect,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-flat-field-metadata-update-side-effect.util';
import { sanitizeRawUpdateFieldInput } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-raw-update-field-input';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

type FromUpdateFieldInputToFlatFieldMetadataArgs = {
  updateFieldInput: UpdateFieldInput;
} & Pick<
  AllFlatEntityMaps,
  | 'flatObjectMetadataMaps'
  | 'flatIndexMaps'
  | 'flatFieldMetadataMaps'
  | 'flatViewFilterMaps'
  | 'flatViewGroupMaps'
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
>;

type FlatFieldMetadataAndIndexToUpdate = {
  flatFieldMetadatasToUpdate: FlatFieldMetadata[];
  flatFieldMetadatasToCreate: FlatFieldMetadata[];
} & FlatFieldMetadataUpdateSideEffects;
export const fromUpdateFieldInputToFlatFieldMetadata = ({
  flatIndexMaps,
  flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
  flatFieldMetadataMaps,
  updateFieldInput: rawUpdateFieldInput,
  flatViewFilterMaps,
  flatViewGroupMaps,
  flatViewMaps,
  flatViewFieldMaps,
}: FromUpdateFieldInputToFlatFieldMetadataArgs): FieldInputTranspilationResult<FlatFieldMetadataAndIndexToUpdate> => {
  const updateFieldInputInformalProperties =
    extractAndSanitizeObjectStringFields(rawUpdateFieldInput, [
      'objectMetadataId',
      'id',
    ]);

  const existingFlatFieldMetadataToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: updateFieldInputInformalProperties.id,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(existingFlatFieldMetadataToUpdate)) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'Field metadata to update not found',
        userFriendlyMessage: msg`Field metadata to update not found`,
      },
    };
  }

  const isStandardField = isStandardMetadata(existingFlatFieldMetadataToUpdate);
  const { standardOverrides, updatedEditableFieldProperties } =
    sanitizeRawUpdateFieldInput({
      existingFlatFieldMetadata: existingFlatFieldMetadataToUpdate,
      rawUpdateFieldInput,
    });

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: existingFlatFieldMetadataToUpdate.objectMetadataId,
    flatEntityMaps: existingFlatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    throw new FieldMetadataException(
      'Field to update object metadata not found',
      FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  const relatedFlatFieldMetadatasToUpdate =
    computeFlatFieldMetadataRelatedFlatFieldMetadata({
      flatFieldMetadata: existingFlatFieldMetadataToUpdate,
      flatFieldMetadataMaps,
      flatObjectMetadata,
    });

  const flatFieldMetadatasToUpdate = [
    existingFlatFieldMetadataToUpdate,
    ...relatedFlatFieldMetadatasToUpdate,
  ];

  const flatFieldMetadatasToCreate =
    flatFieldMetadatasToCreateForMorphRelationsPayload({
      morphRelationsUpdatePayload:
        rawUpdateFieldInput?.morphRelationsUpdatePayload,
      flatFieldMetadataMaps: flatFieldMetadataMaps,
      fieldMetadataToUpdate: existingFlatFieldMetadataToUpdate,
    });

  const initialAccumulator: FlatFieldMetadataAndIndexToUpdate = {
    ...structuredClone(FLAT_FIELD_METADATA_UPDATE_EMPTY_SIDE_EFFECTS),
    flatFieldMetadatasToUpdate: [],
    flatFieldMetadatasToCreate: flatFieldMetadatasToCreate,
  };

  updatedEditableFieldProperties.options = !isDefined(
    updatedEditableFieldProperties.options,
  )
    ? updatedEditableFieldProperties.options
    : updatedEditableFieldProperties.options.map((option) => ({
        id: v4(),
        ...option,
      }));

  const optimisticiallyUpdatedFlatFieldMetadatas =
    flatFieldMetadatasToUpdate.reduce<FlatFieldMetadataAndIndexToUpdate>(
      (accumulator, fromFlatFieldMetadata) => {
        const toFlatFieldMetadata = {
          ...mergeUpdateInExistingRecord({
            existing: fromFlatFieldMetadata,
            properties:
              FLAT_FIELD_METADATA_EDITABLE_PROPERTIES[
                isStandardField ? 'standard' : 'custom'
              ],
            update: updatedEditableFieldProperties,
          }),
          standardOverrides,
        };

        const {
          flatViewGroupsToCreate,
          flatViewGroupsToDelete,
          flatViewGroupsToUpdate,
          flatIndexMetadatasToUpdate,
          flatViewFiltersToDelete,
          flatViewFiltersToUpdate,
          flatIndexMetadatasToCreate,
          flatIndexMetadatasToDelete,
          flatViewsToDelete,
          flatViewFieldsToDelete,
          flatViewsToUpdate,
        } = handleFlatFieldMetadataUpdateSideEffect({
          flatViewFilterMaps,
          flatViewGroupMaps,
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          fromFlatFieldMetadata,
          flatFieldMetadataMaps,
          flatIndexMaps,
          toFlatFieldMetadata,
          flatViewMaps,
          flatViewFieldMaps,
        });

        return {
          flatFieldMetadatasToUpdate: [
            ...accumulator.flatFieldMetadatasToUpdate,
            toFlatFieldMetadata,
          ],
          flatFieldMetadatasToCreate: [
            ...accumulator.flatFieldMetadatasToCreate,
          ],
          flatIndexMetadatasToUpdate: [
            ...accumulator.flatIndexMetadatasToUpdate,
            ...flatIndexMetadatasToUpdate,
          ],
          flatViewFiltersToDelete: [
            ...accumulator.flatViewFiltersToDelete,
            ...flatViewFiltersToDelete,
          ],
          flatViewFiltersToUpdate: [
            ...accumulator.flatViewFiltersToUpdate,
            ...flatViewFiltersToUpdate,
          ],
          flatViewGroupsToCreate: [
            ...accumulator.flatViewGroupsToCreate,
            ...flatViewGroupsToCreate,
          ],
          flatViewGroupsToDelete: [
            ...accumulator.flatViewGroupsToDelete,
            ...flatViewGroupsToDelete,
          ],
          flatViewGroupsToUpdate: [
            ...accumulator.flatViewGroupsToUpdate,
            ...flatViewGroupsToUpdate,
          ],
          flatIndexMetadatasToDelete: [
            ...accumulator.flatIndexMetadatasToDelete,
            ...flatIndexMetadatasToDelete,
          ],
          flatIndexMetadatasToCreate: [
            ...accumulator.flatIndexMetadatasToCreate,
            ...flatIndexMetadatasToCreate,
          ],
          flatViewsToDelete: [
            ...accumulator.flatViewsToDelete,
            ...flatViewsToDelete,
          ],
          flatViewFieldsToDelete: [
            ...accumulator.flatViewFieldsToDelete,
            ...flatViewFieldsToDelete,
          ],
          flatViewsToUpdate: [
            ...accumulator.flatViewsToUpdate,
            ...flatViewsToUpdate,
          ],
        };
      },
      initialAccumulator,
    );

  return {
    status: 'success',
    result: optimisticiallyUpdatedFlatFieldMetadatas,
  };
};

const flatFieldMetadatasToCreateForMorphRelationsPayload = ({
  flatFieldMetadataMaps,
  morphRelationsUpdatePayload,
  fieldMetadataToUpdate,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  morphRelationsUpdatePayload?: RelationUpdatePayload[];
  fieldMetadataToUpdate: FlatFieldMetadata;
}): FlatFieldMetadata[] => {
  // todo @guillim : make it wokr for morph relations update payload

  // if (!isDefined(morphRelationsUpdatePayload)) {
  //   return [];
  // }

  // if (fieldMetadataToUpdate.type !== FieldMetadataType.MORPH_RELATION) {
  //   throw new FieldMetadataException(
  //     'Field metadata to update is not a morph or relation field metadata',
  //     FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
  //   );
  // }

  // const morphId = fieldMetadataToUpdate.morphId;
  // const allExistingFieldMetadataMorphSiblings = Object.values(
  //   flatFieldMetadataMaps.byId,
  // )
  //   .filter(isDefined)
  //   .filter((fieldMetadata) => fieldMetadata.morphId === morphId);

  // morphRelationsUpdatePayload.forEach((morphRelationUpdatePayload) => {
  //   const { targetObjectMetadataId } = morphRelationUpdatePayload;
  //   const newFieldMetadata = {
  //     ...getDefaultFlatFieldMetadata({
  //       createFieldInput: {
  //         type: FieldMetadataType.MORPH_RELATION,
  //         name: computeMetadataNameFromLabel(
  //           morphRelationUpdatePayload.targetFieldLabel,
  //         ),
  //         objectMetadataId: targetObjectMetadataId,
  //       },
  //       workspaceId: fieldMetadataToUpdate.workspaceId,
  //       fieldMetadataId: v4(),
  //     }),
  //     ...morphRelationUpdatePayload,
  //   };
  // });

  return [];
};
