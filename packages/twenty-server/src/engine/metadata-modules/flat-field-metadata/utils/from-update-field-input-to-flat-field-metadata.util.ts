import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  type RelationUpdatePayload,
} from 'twenty-shared/types';
import {
  computeMorphRelationFieldName,
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-to-update-and-related-flat-field-to-update.util';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import {
  FLAT_FIELD_METADATA_UPDATE_EMPTY_SIDE_EFFECTS,
  type FlatFieldMetadataUpdateSideEffects,
  handleFlatFieldMetadataUpdateSideEffect,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-flat-field-metadata-update-side-effect.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

type FromUpdateFieldInputToFlatFieldMetadataArgs = {
  updateFieldInput: UpdateFieldInput;
  workspaceCustomApplicationId: string;
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

  const { flatFieldMetadatasToCreate, flatIndexMetadatasToCreate } =
    flatFieldMetadatasToCreateForMorphRelationsPayload({
      workspaceCustomApplicationId,
      morphRelationsUpdatePayload:
        rawUpdateFieldInput?.morphRelationsUpdatePayload,
      flatFieldMetadataMaps: flatFieldMetadataMaps,
      fieldMetadataToUpdate: existingFlatFieldMetadataToUpdate,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    });

  const initialAccumulator: FlatFieldMetadataAndIndexToUpdate = {
    ...structuredClone(FLAT_FIELD_METADATA_UPDATE_EMPTY_SIDE_EFFECTS),
    flatFieldMetadatasToUpdate: [],
    flatFieldMetadatasToCreate: flatFieldMetadatasToCreate,
    flatIndexMetadatasToCreate: flatIndexMetadatasToCreate,
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
  workspaceCustomApplicationId,
  flatFieldMetadataMaps,
  morphRelationsUpdatePayload,
  fieldMetadataToUpdate,
  flatObjectMetadataMaps,
}: {
  workspaceCustomApplicationId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  morphRelationsUpdatePayload?: RelationUpdatePayload[];
  fieldMetadataToUpdate: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): {
  flatFieldMetadatasToCreate: FlatFieldMetadata[];
  flatIndexMetadatasToCreate: FlatIndexMetadata[];
} => {
  const flatFieldMetadatasToCreate: FlatFieldMetadata[] = [];
  const flatIndexMetadatasToCreate: FlatIndexMetadata[] = [];

  if (!isDefined(morphRelationsUpdatePayload)) {
    return { flatFieldMetadatasToCreate, flatIndexMetadatasToCreate };
  }

  if (
    !isFlatFieldMetadataOfType(
      fieldMetadataToUpdate,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    throw new FieldMetadataException(
      'Field metadata to update is not a morph or relation field metadata',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const sourceObjectMetadata = getSourceObjectMetadataFromFieldMetadata(
    fieldMetadataToUpdate,
    flatObjectMetadataMaps,
  );

  const morphRelationsCommonLabel = fieldMetadataToUpdate.label;

  const initialFlatFieldMetadataTargetObjectMetadata =
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataToUpdate.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

  if (!isDefined(initialFlatFieldMetadataTargetObjectMetadata)) {
    throw new FieldMetadataException(
      'Initial flat field metadata target object metadata not found',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const morphNameWithoutObjectName = getMorphNameFromMorphFieldMetadataName({
    morphRelationFlatFieldMetadata: {
      name: fieldMetadataToUpdate.name,
      settings: fieldMetadataToUpdate.settings,
    },
    nameSingular: initialFlatFieldMetadataTargetObjectMetadata.nameSingular,
    namePlural: initialFlatFieldMetadataTargetObjectMetadata.namePlural,
  });

  const initialTargetFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataToUpdate.relationTargetFieldMetadataId ?? '',
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const commonTargetFieldLabel = initialTargetFieldMetadata?.label ?? '';
  const commonTargetFieldName = initialTargetFieldMetadata?.name ?? '';

  morphRelationsUpdatePayload.forEach((morphRelationUpdatePayload) => {
    const { targetObjectMetadataId } = morphRelationUpdatePayload;

    const newTargetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: targetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(newTargetObjectMetadata)) {
      throw new FieldMetadataException(
        'New target object metadata not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    const computedMorphName = computeMorphRelationFieldName({
      fieldName: morphNameWithoutObjectName,
      relationType: fieldMetadataToUpdate.settings.relationType,
      targetObjectMetadataNameSingular: newTargetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural: newTargetObjectMetadata.namePlural,
    });

    checkConflictInOtherFieldMetadataNames({
      morphId: fieldMetadataToUpdate.morphId ?? '',
      flatFieldMetadataMaps,
      newMorphRelationName: computedMorphName,
    });

    const { flatFieldMetadatas, indexMetadatas } =
      generateMorphOrRelationFlatFieldMetadataPair({
        createFieldInput: {
          type: FieldMetadataType.MORPH_RELATION,
          name: computedMorphName,
          label: morphRelationsCommonLabel,
          objectMetadataId: initialTargetFieldMetadata?.objectMetadataId ?? '',
          relationCreationPayload: {
            type: fieldMetadataToUpdate.settings.relationType,
            targetObjectMetadataId,
            targetFieldLabel: commonTargetFieldLabel,
            targetFieldIcon: fieldMetadataToUpdate.icon ?? 'Icon123',
            targetFieldName: commonTargetFieldName,
          },
        },
        sourceFlatObjectMetadata: sourceObjectMetadata,
        targetFlatObjectMetadata: newTargetObjectMetadata,
        workspaceId: fieldMetadataToUpdate.workspaceId,
        workspaceCustomApplicationId,
        sourceFlatObjectMetadataJoinColumnName:
          computeMorphOrRelationFieldJoinColumnName({
            name: computedMorphName,
          }),
        morphId: fieldMetadataToUpdate.morphId,
      });

    flatFieldMetadatasToCreate.push(...flatFieldMetadatas);
    flatIndexMetadatasToCreate.push(...indexMetadatas);
  });

  return { flatFieldMetadatasToCreate, flatIndexMetadatasToCreate };
};

const getSourceObjectMetadataFromFieldMetadata = (
  fieldMetadata: FlatFieldMetadata,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
) => {
  const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadata.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(sourceFlatObjectMetadata)) {
    throw new FieldMetadataException(
      'Target flat object metadata not found',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  return sourceFlatObjectMetadata;
};

const checkConflictInOtherFieldMetadataNames = ({
  flatFieldMetadataMaps,
  morphId,
  newMorphRelationName,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  morphId: string;
  newMorphRelationName: string;
}) => {
  const allExistingFieldMetadataMorphSiblings = Object.values(
    flatFieldMetadataMaps.byId,
  )
    .filter(isDefined)
    .filter((fieldMetadata) => fieldMetadata.morphId === morphId)
    .map((fieldMetadata) => fieldMetadata.name);

  const isNameAlreadyExists =
    allExistingFieldMetadataMorphSiblings.includes(newMorphRelationName);

  if (isNameAlreadyExists) {
    throw new FieldMetadataException(
      'Field metadata name already exists',
      FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS,
      {
        userFriendlyMessage: msg`Relation name already exists`,
      },
    );
  }
};
