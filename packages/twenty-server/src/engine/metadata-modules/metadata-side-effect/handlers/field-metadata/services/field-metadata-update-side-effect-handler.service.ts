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
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

@Injectable()
export class FieldMetadataUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  'update',
  'fieldMetadata',
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationByMetadataName,
    context,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectOperationsByMetadataName {
    if (isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata)) {
      return {};
    }

    const existingFlatFieldMetadata =
      context.existingAllFlatEntityMaps?.flatFieldMetadataMaps
        ?.byUniversalIdentifier[flatFieldMetadata.universalIdentifier];

    if (!isDefined(existingFlatFieldMetadata)) {
      return {};
    }

    const wasUnique = existingFlatFieldMetadata.isUnique === true;
    const isUnique = flatFieldMetadata.isUnique === true;
    const wasRenamed =
      existingFlatFieldMetadata.name !== flatFieldMetadata.name;

    // The backing index name (and therefore its deterministic universal identifier) is derived
    // from the field name, so a rename means dropping the old index and recreating it.
    if (!wasUnique && !isUnique) {
      return {};
    }

    if (wasUnique && isUnique && !wasRenamed) {
      return {};
    }

    const parentFlatObjectMetadata =
      resolveParentFlatObjectMetadataForFieldSideEffect({
        objectMetadataUniversalIdentifier:
          flatFieldMetadata.objectMetadataUniversalIdentifier,
        allFlatEntityOperationByMetadataName,
        context,
      });

    if (!isDefined(parentFlatObjectMetadata)) {
      return {};
    }

    const flatIndexMetadataToCreate: UniversalFlatIndexMetadata[] = [];
    const flatIndexMetadataToDelete: UniversalFlatIndexMetadata[] = [];

    if (wasUnique) {
      const previousFlatIndexMetadata =
        generateDeterministicIndexForFlatFieldMetadata({
          flatFieldMetadata: {
            ...flatFieldMetadata,
            name: existingFlatFieldMetadata.name,
            isUnique: true,
          },
          flatObjectMetadata: parentFlatObjectMetadata,
        });

      const previousIndexExistsInWorkspace = isDefined(
        context.existingAllFlatEntityMaps?.flatIndexMaps?.byUniversalIdentifier[
          previousFlatIndexMetadata.universalIdentifier
        ],
      );

      if (previousIndexExistsInWorkspace) {
        flatIndexMetadataToDelete.push(previousFlatIndexMetadata);
      }
    }

    if (isUnique) {
      flatIndexMetadataToCreate.push(
        generateDeterministicIndexForFlatFieldMetadata({
          flatFieldMetadata: { ...flatFieldMetadata, isUnique: true },
          flatObjectMetadata: parentFlatObjectMetadata,
        }),
      );
    }

    if (
      flatIndexMetadataToCreate.length === 0 &&
      flatIndexMetadataToDelete.length === 0
    ) {
      return {};
    }

    return {
      index: {
        ...(flatIndexMetadataToCreate.length > 0
          ? { flatEntityToCreate: flatIndexMetadataToCreate }
          : {}),
        ...(flatIndexMetadataToDelete.length > 0
          ? { flatEntityToDelete: flatIndexMetadataToDelete }
          : {}),
      },
    };
  }
}
