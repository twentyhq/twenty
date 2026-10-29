/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { getRelatedRecordPathFieldMetadataUniversalIdentifiers } from 'src/engine/metadata-modules/related-record-path/utils/get-related-record-path-field-metadata-universal-identifiers.util';

@Injectable()
export class ObjectRelatedRecordPathsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'objectMetadata',
    name: 'objectRelatedRecordPathsOnDelete',
    description:
      'When an object is deleted, delete every related record path that starts on it, ends on it or goes through it, so the paths leave the metadata cache in the same migration that drops their object.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const relatedRecordPathsToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'relatedRecordPath'>
    > = {};

    for (const flatRelatedRecordPath of Object.values(
      relatedFlatEntityMaps.flatRelatedRecordPathMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatRelatedRecordPath)) {
        continue;
      }

      const isThroughDeletedObject =
        getRelatedRecordPathFieldMetadataUniversalIdentifiers(
          flatRelatedRecordPath,
        ).some(
          (fieldMetadataUniversalIdentifier) =>
            relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
              fieldMetadataUniversalIdentifier
            ]?.objectMetadataUniversalIdentifier ===
            flatObjectMetadata.universalIdentifier,
        );

      if (
        isThroughDeletedObject ||
        flatRelatedRecordPath.sourceObjectMetadataUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier ||
        flatRelatedRecordPath.targetObjectMetadataUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier
      ) {
        relatedRecordPathsToDelete[flatRelatedRecordPath.universalIdentifier] =
          flatRelatedRecordPath;
      }
    }

    if (Object.keys(relatedRecordPathsToDelete).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        relatedRecordPath: { flatEntityToDelete: relatedRecordPathsToDelete },
      },
    };
  }
}
