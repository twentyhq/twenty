import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { generateDeterministicIndexForFlatFieldMetadataOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-deterministic-index-for-flat-field-metadata-or-throw.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { buildFieldSideEffectParentNotFoundFailure } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-side-effect-parent-not-found-failure.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldUniqueBackingIndexOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldUniqueBackingIndexOnDelete',
    description:
      'When a unique scalar field is deleted, cascade-delete the single-field UNIQUE index that backed its uniqueness constraint.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    if (
      flatFieldMetadata.isUnique !== true ||
      isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata)
    ) {
      return { status: 'noop' };
    }
    const parentFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(parentFlatObjectMetadata)) {
      return buildFieldSideEffectParentNotFoundFailure({
        flatFieldMetadata,
        operation: 'delete',
      });
    }

    const flatIndexMetadataToDelete =
      generateDeterministicIndexForFlatFieldMetadataOrThrow({
        flatFieldMetadata,
        flatObjectMetadata: parentFlatObjectMetadata,
      });

    const indexExistsInWorkspace = isDefined(
      relatedFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
        flatIndexMetadataToDelete.universalIdentifier
      ],
    );

    if (!indexExistsInWorkspace) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        index: {
          flatEntityToDelete: {
            [flatIndexMetadataToDelete.universalIdentifier]:
              flatIndexMetadataToDelete,
          },
        },
      },
    };
  }
}
