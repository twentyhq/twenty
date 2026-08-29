import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { renameRelatedMorphFieldOnObjectNamesUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/rename-related-morph-field-on-object-names-update.util';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

@Injectable()
export class ObjectSystemRelationsOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'objectMetadata',
    name: 'objectSystemRelationsOnUpdate',
    description:
      'When an object is renamed, rename the reverse MORPH_RELATION fields of its default relations to the standard objects (timelineActivity, attachment, noteTarget, taskTarget) and recompute their join-column index names. These reverse fields are isSystemSideEffect, so the engine is their sole authority on rename across both the API and manifest-sync paths (the API transpiler renames only user-authored morph relations). The reverse field universal identifier is name-free, so a rename stays a lossless update. The computed updates are emitted unconditionally; any universal identifier collision with a caller-provided operation is arbitrated by the engine merge.',
  },
) {
  buildSideEffects({
    flatEntity,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const updatedFlatObjectMetadata = flatEntity as UniversalFlatObjectMetadata;

    const existingFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        updatedFlatObjectMetadata.universalIdentifier
      ];

    if (!isDefined(existingFlatObjectMetadata)) {
      return {
        status: 'fail',
        type: 'update',
        metadataName: 'objectMetadata',
        flatEntityMinimalInformation: {
          universalIdentifier: updatedFlatObjectMetadata.universalIdentifier,
          nameSingular: updatedFlatObjectMetadata.nameSingular,
        } as Partial<MetadataFlatEntity<'objectMetadata'>>,
        errors: [
          {
            code: MetadataSideEffectExceptionCode.SIDE_EFFECT_PARENT_METADATA_NOT_FOUND,
            message: t`Could not resolve the existing object "${updatedFlatObjectMetadata.nameSingular}" to rename its default relations`,
            userFriendlyMessage: msg`The object to rename could not be found to update its default relations`,
          },
        ],
      };
    }

    const isRenamed =
      existingFlatObjectMetadata.nameSingular !==
        updatedFlatObjectMetadata.nameSingular ||
      existingFlatObjectMetadata.namePlural !==
        updatedFlatObjectMetadata.namePlural;

    if (!isRenamed) {
      return { status: 'noop' };
    }

    const { morphFlatFieldMetadatasToUpdate, morphRelatedFlatIndexesToUpdate } =
      renameRelatedMorphFieldOnObjectNamesUpdate({
        fromFlatObjectMetadata: existingFlatObjectMetadata,
        toFlatObjectMetadata: {
          ...existingFlatObjectMetadata,
          nameSingular: updatedFlatObjectMetadata.nameSingular,
          namePlural: updatedFlatObjectMetadata.namePlural,
        },
        flatFieldMetadataMaps: relatedFlatEntityMaps.flatFieldMetadataMaps,
        flatObjectMetadataMaps: relatedFlatEntityMaps.flatObjectMetadataMaps,
        flatIndexMaps: relatedFlatEntityMaps.flatIndexMaps,
        systemSideEffectMorphFieldsOnly: true,
      });

    if (
      morphFlatFieldMetadatasToUpdate.length === 0 &&
      morphRelatedFlatIndexesToUpdate.length === 0
    ) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        fieldMetadata: {
          flatEntityToUpdate: fromArrayToUniqueKeyRecord({
            array: morphFlatFieldMetadatasToUpdate,
            uniqueKey: 'universalIdentifier',
          }),
        },
        index: {
          flatEntityToUpdate: fromArrayToUniqueKeyRecord({
            array: morphRelatedFlatIndexesToUpdate,
            uniqueKey: 'universalIdentifier',
          }),
        },
      },
    };
  }
}
