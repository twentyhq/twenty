import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { generateDeterministicIndexForFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-deterministic-index-for-flat-field-metadata.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { resolveParentFlatObjectMetadataForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-for-field-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';

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
    allFlatEntityOperationIndexByMetadataName,
    context,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectOperationsByMetadataName {
    if (
      flatFieldMetadata.isUnique !== true ||
      isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata)
    ) {
      return {};
    }

    const parentFlatObjectMetadata =
      resolveParentFlatObjectMetadataForFieldSideEffect({
        objectMetadataUniversalIdentifier:
          flatFieldMetadata.objectMetadataUniversalIdentifier,
        allFlatEntityOperationIndexByMetadataName,
        context,
      });

    if (!isDefined(parentFlatObjectMetadata)) {
      return {};
    }

    const flatIndexMetadata = generateDeterministicIndexForFlatFieldMetadata({
      flatFieldMetadata,
      flatObjectMetadata: parentFlatObjectMetadata,
    });

    return {
      index: {
        flatEntityToCreate: [flatIndexMetadata],
      },
    };
  }
}
