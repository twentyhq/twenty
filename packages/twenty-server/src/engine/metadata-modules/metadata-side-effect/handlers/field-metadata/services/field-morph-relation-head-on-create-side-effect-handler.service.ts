import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { buildMorphRelationHeadFromTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-morph-relation-head-from-target.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveParentFlatObjectMetadataAfterStateForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-after-state-for-field-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldMorphRelationHeadOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'fieldMetadata',
    name: 'fieldMorphRelationHeadOnCreate',
    description:
      'When a morph relation target is created and its morph relation has no head yet, create the head: an engine-owned MORPH_RELATION field whose universal identifier is the morphId, with no relation target and no column. The first target of a batch emits it and the others see it in the pending operations, so a morph field created with several targets gets one head. Noop when the head already exists or is created in the same batch, and for engine-emitted targets (such as the reverse relations objectSystemRelationsOnCreate adds to standard morph fields), which only ever join an existing morph relation. twenty-standard declares its heads itself and does not run through this handler.',
  },
) {
  buildSideEffects({
    flatEntity: target,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    if (
      !isFlatFieldMetadataOfType(target, FieldMetadataType.MORPH_RELATION) ||
      isMorphRelationHead(target) ||
      target.isSystemSideEffect
    ) {
      return { status: 'noop' };
    }

    const fieldsToCreate =
      allFlatEntityOperationRecordByMetadataName.fieldMetadata
        ?.flatEntityToCreate ?? {};

    const headAlreadyExists =
      isDefined(fieldsToCreate[target.morphId]) ||
      isDefined(
        relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          target.morphId
        ],
      );

    if (headAlreadyExists) {
      return { status: 'noop' };
    }

    const targetObject =
      resolveParentFlatObjectMetadataAfterStateForFieldSideEffect({
        objectMetadataUniversalIdentifier:
          target.relationTargetObjectMetadataUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
        relatedFlatEntityMaps,
      });

    if (!isDefined(targetObject)) {
      return { status: 'noop' };
    }

    const head = buildMorphRelationHeadFromTarget({
      target,
      targetObject,
    });

    return {
      status: 'success',
      operations: {
        fieldMetadata: {
          flatEntityToCreate: { [head.universalIdentifier]: head },
        },
      },
    };
  }
}
