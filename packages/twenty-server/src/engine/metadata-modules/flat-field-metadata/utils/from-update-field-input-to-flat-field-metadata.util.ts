import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-to-update-and-related-flat-field-to-update.util';
import { computeFlatFieldToUpdateFromMorphRelationUpdatePayload } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-to-update-from-morph-relation-update-payload.util';
import {
  FLAT_FIELD_METADATA_UPDATE_EMPTY_SIDE_EFFECTS,
  type FlatFieldMetadataUpdateSideEffects,
  handleFlatFieldMetadataUpdateSideEffect,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-flat-field-metadata-update-side-effect.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

type FromUpdateFieldInputToFlatFieldMetadataArgs = {
  updateFieldInput: UpdateFieldInput;
  workspaceCustomApplicationId: string;
  isSystemBuild: boolean;
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
  workspaceCustomApplicationId,
  flatIndexMaps,
  flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
  flatFieldMetadataMaps,
  updateFieldInput: rawUpdateFieldInput,
  flatViewFilterMaps,
  flatViewGroupMaps,
  flatViewMaps,
  flatViewFieldMaps,
  isSystemBuild,
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
      errors: [
        {
          code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
          message: 'Field metadata to update not found',
          userFriendlyMessage: msg`Field metadata to update not found`,
        },
      ],
    };
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: existingFlatFieldMetadataToUpdate.objectMetadataId,
    flatEntityMaps: existingFlatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    return {
      status: 'fail',
      errors: [
        {
          code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
          message: 'Field to update object metadata not found',
          userFriendlyMessage: msg`Field to update object metadata not found`,
        },
      ],
    };
  }

  const { flatFieldMetadataFromTo, relatedFlatFieldMetadatasFromTo } =
    computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate({
      flatFieldMetadataMaps,
      flatObjectMetadata,
      fromFlatFieldMetadata: existingFlatFieldMetadataToUpdate,
      rawUpdateFieldInput,
      isSystemBuild,
    });

  const { flatFieldMetadatasToCreate, flatIndexMetadatasToCreate } =
    isFlatFieldMetadataOfType(
      flatFieldMetadataFromTo.toFlatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
      ? computeFlatFieldToUpdateFromMorphRelationUpdatePayload({
          workspaceCustomApplicationId,
          morphRelationsUpdatePayload:
            rawUpdateFieldInput?.morphRelationsUpdatePayload,
          flatFieldMetadataMaps: flatFieldMetadataMaps,
          fieldMetadataToUpdate: flatFieldMetadataFromTo.toFlatFieldMetadata,
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
        })
      : {
          flatFieldMetadatasToCreate: [],
          flatIndexMetadatasToCreate: [],
        };

  const initialAccumulator: FlatFieldMetadataAndIndexToUpdate & {
    errors: FlatFieldMetadataValidationError[];
  } = {
    ...structuredClone(FLAT_FIELD_METADATA_UPDATE_EMPTY_SIDE_EFFECTS),
    flatFieldMetadatasToUpdate: [],
    flatFieldMetadatasToCreate: flatFieldMetadatasToCreate,
    flatIndexMetadatasToCreate: flatIndexMetadatasToCreate,
    errors: [],
  };

  const { errors: sideEffectErrors, ...sideEffectFlatEntityOperations } = [
    flatFieldMetadataFromTo,
    ...relatedFlatFieldMetadatasFromTo,
  ].reduce<
    FlatFieldMetadataAndIndexToUpdate & {
      errors: FlatFieldMetadataValidationError[];
    }
  >((accumulator, { fromFlatFieldMetadata, toFlatFieldMetadata }) => {
    const sideEffectResult = handleFlatFieldMetadataUpdateSideEffect({
      flatViewFilterMaps,
      flatViewGroupMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      fromFlatFieldMetadata,
      flatFieldMetadataMaps,
      flatIndexMaps,
      toFlatFieldMetadata,
      flatViewMaps,
      flatViewFieldMaps,
      workspaceCustomApplicationId,
    });

    if (sideEffectResult.status === 'fail') {
      return {
        ...accumulator,
        errors: [...accumulator.errors, ...sideEffectResult.errors],
      };
    }

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
      flatFieldMetadatasToUpdate: flatFieldMetadatasToUpdateFromSideEffect,
    } = sideEffectResult.result;

    return {
      flatFieldMetadatasToUpdate: [
        ...accumulator.flatFieldMetadatasToUpdate,
        toFlatFieldMetadata,
        ...flatFieldMetadatasToUpdateFromSideEffect,
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
      errors: accumulator.errors,
    };
  }, initialAccumulator);

  if (sideEffectErrors.length > 0) {
    return {
      status: 'fail',
      errors: sideEffectErrors,
    };
  }

  return {
    status: 'success',
    result: sideEffectFlatEntityOperations,
  };
};
