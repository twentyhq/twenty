import { msg } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-to-update-and-related-flat-field-to-update.util';
import {
  FLAT_FIELD_METADATA_UPDATE_EMPTY_SIDE_EFFECTS,
  type FlatFieldMetadataUpdateSideEffects,
  handleFlatFieldMetadataUpdateSideEffect,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-flat-field-metadata-update-side-effect.util';

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

  const { flatFieldMetadataFromTo, relatedFlatFieldMetadatasFromTo } =
    computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate({
      flatFieldMetadataMaps,
      flatObjectMetadata,
      fromFlatFieldMetadata: existingFlatFieldMetadataToUpdate,
      rawUpdateFieldInput,
    });

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

  const optimisticiallyUpdatedFlatFieldMetadatas = [
    flatFieldMetadataFromTo,
    ...relatedFlatFieldMetadatasFromTo,
  ].reduce<FlatFieldMetadataAndIndexToUpdate>(
    (accumulator, { fromFlatFieldMetadata, toFlatFieldMetadata }) => {
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
        flatIndexMetadatasToUpdate: [
          ...accumulator.flatIndexMetadatasToUpdate,
          ...flatIndexMetadatasToUpdate,
        ],
        flatFieldMetadatasToCreate: [...accumulator.flatFieldMetadatasToCreate],
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
