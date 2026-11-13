import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { findUniqueFieldBackingFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/find-unique-field-backing-flat-index-metadata.util';
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
    const flatIndexMetadataToDelete = findUniqueFieldBackingFlatIndexMetadata({
      fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
      flatIndexMaps: relatedFlatEntityMaps.flatIndexMaps,
    });

    if (!isDefined(flatIndexMetadataToDelete)) {
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
