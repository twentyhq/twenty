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
export class FieldUniqueBackingIndexOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'fieldMetadata',
    name: 'fieldUniqueBackingIndexOnCreate',
    description:
      'When a unique scalar field is created, generate the single-field UNIQUE index that enforces its uniqueness constraint at the database level.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    if (
      flatFieldMetadata.isUnique !== true ||
      isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata)
    ) {
      return { status: 'noop' };
    }

    if (isPrimaryKeyFlatFieldMetadata(flatFieldMetadata)) {
      return { status: 'noop' };
    }

    const parentFlatObjectMetadata =
      resolveParentFlatObjectMetadataAfterStateForFieldSideEffect({
        objectMetadataUniversalIdentifier:
          flatFieldMetadata.objectMetadataUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
        relatedFlatEntityMaps,
      });

    if (!isDefined(parentFlatObjectMetadata)) {
      return buildFieldSideEffectParentNotFoundFailure({
        flatFieldMetadata,
        operation: 'create',
      });
    }

    const flatIndexMetadata =
      generateDeterministicIndexForFlatFieldMetadataOrThrow({
        flatFieldMetadata,
        flatObjectMetadata: parentFlatObjectMetadata,
      });

    return {
      status: 'success',
      operations: {
        index: {
          flatEntityToCreate: {
            [flatIndexMetadata.universalIdentifier]: flatIndexMetadata,
          },
        },
      },
    };
  }
}
