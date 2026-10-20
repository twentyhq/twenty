/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldRecordInheritanceRulesOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldRecordInheritanceRulesOnDelete',
    description:
      'When a field is deleted, delete every record inheritance rule that follows it, directly or as the junction field.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const recordInheritanceRulesToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'recordInheritanceRule'>
    > = {};

    for (const flatRecordInheritanceRule of Object.values(
      relatedFlatEntityMaps.flatRecordInheritanceRuleMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(flatRecordInheritanceRule) &&
        (flatRecordInheritanceRule.fieldMetadataUniversalIdentifier ===
          flatFieldMetadata.universalIdentifier ||
          flatRecordInheritanceRule.junctionFieldMetadataUniversalIdentifier ===
            flatFieldMetadata.universalIdentifier)
      ) {
        recordInheritanceRulesToDelete[
          flatRecordInheritanceRule.universalIdentifier
        ] = flatRecordInheritanceRule;
      }
    }

    if (Object.keys(recordInheritanceRulesToDelete).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        recordInheritanceRule: {
          flatEntityToDelete: recordInheritanceRulesToDelete,
        },
      },
    };
  }
}
