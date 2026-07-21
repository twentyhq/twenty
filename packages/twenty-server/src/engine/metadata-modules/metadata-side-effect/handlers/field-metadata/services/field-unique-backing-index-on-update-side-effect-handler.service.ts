import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { generateDeterministicIndexForFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-deterministic-index-for-flat-field-metadata-or-throw.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isPrimaryKeyFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-primary-key-flat-field-metadata.util';
import { buildFieldSideEffectParentNotFoundFailure } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-side-effect-parent-not-found-failure.util';
import { resolveParentFlatObjectMetadataAfterStateForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-after-state-for-field-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldUniqueBackingIndexOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldUniqueBackingIndexOnUpdate',
    description:
      "Keep a unique scalar field's backing UNIQUE index in sync when its `isUnique` flag flips or the field is renamed (drop the stale index and recreate the deterministic one).",
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    if (isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata)) {
      return { status: 'noop' };
    }

    if (isPrimaryKeyFlatFieldMetadata(flatFieldMetadata)) {
      return { status: 'noop' };
    }

    const existingFlatFieldMetadata =
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.universalIdentifier
      ];

    if (!isDefined(existingFlatFieldMetadata)) {
      return { status: 'noop' };
    }

    const wasRenamed =
      existingFlatFieldMetadata.name !== flatFieldMetadata.name;

    const uniquenessHasFlipped =
      existingFlatFieldMetadata.isUnique !== flatFieldMetadata.isUnique;
    const backingIndexMustFollowRename =
      existingFlatFieldMetadata.isUnique === true &&
      flatFieldMetadata.isUnique === true &&
      wasRenamed;

    if (!uniquenessHasFlipped && !backingIndexMustFollowRename) {
      return { status: 'noop' };
    }

    const existingFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];
    const optimisticFlatObjectMetadata =
      resolveParentFlatObjectMetadataAfterStateForFieldSideEffect({
        objectMetadataUniversalIdentifier:
          flatFieldMetadata.objectMetadataUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
        relatedFlatEntityMaps,
      });

    const backingIndexMustBeDeleted =
      existingFlatFieldMetadata.isUnique === true;
    const backingIndexMustBeCreated = flatFieldMetadata.isUnique === true;

    if (
      (backingIndexMustBeDeleted && !isDefined(existingFlatObjectMetadata)) ||
      (backingIndexMustBeCreated && !isDefined(optimisticFlatObjectMetadata))
    ) {
      return buildFieldSideEffectParentNotFoundFailure({
        flatFieldMetadata,
        operation: 'update',
      });
    }

    const previousFlatIndexMetadata =
      backingIndexMustBeDeleted && isDefined(existingFlatObjectMetadata)
        ? generateDeterministicIndexForFlatFieldMetadataOrThrow({
            flatFieldMetadata: {
              ...flatFieldMetadata,
              name: existingFlatFieldMetadata.name,
              isUnique: true,
            },
            flatObjectMetadata: existingFlatObjectMetadata,
          })
        : undefined;

    const flatIndexMetadataToDelete =
      isDefined(previousFlatIndexMetadata) &&
      isDefined(
        relatedFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
          previousFlatIndexMetadata.universalIdentifier
        ],
      )
        ? previousFlatIndexMetadata
        : undefined;

    const flatIndexMetadataToCreate =
      backingIndexMustBeCreated && isDefined(optimisticFlatObjectMetadata)
        ? generateDeterministicIndexForFlatFieldMetadataOrThrow({
            flatFieldMetadata: { ...flatFieldMetadata, isUnique: true },
            flatObjectMetadata: optimisticFlatObjectMetadata,
          })
        : undefined;

    if (
      !isDefined(flatIndexMetadataToCreate) &&
      !isDefined(flatIndexMetadataToDelete)
    ) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        index: {
          ...(isDefined(flatIndexMetadataToCreate)
            ? {
                flatEntityToCreate: {
                  [flatIndexMetadataToCreate.universalIdentifier]:
                    flatIndexMetadataToCreate,
                },
              }
            : {}),
          ...(isDefined(flatIndexMetadataToDelete)
            ? {
                flatEntityToDelete: {
                  [flatIndexMetadataToDelete.universalIdentifier]:
                    flatIndexMetadataToDelete,
                },
              }
            : {}),
        },
      },
    };
  }
}
