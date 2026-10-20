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
export class ObjectRecordInheritanceRulesOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'objectMetadata',
    name: 'objectRecordInheritanceRulesOnDelete',
    description:
      'When an object is deleted, delete every record inheritance rule where it is the inheriting or the parent object.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const recordInheritanceRulesToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'recordInheritanceRule'>
    > = {};

    for (const flatRecordInheritanceRule of Object.values(
      relatedFlatEntityMaps.flatRecordInheritanceRuleMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(flatRecordInheritanceRule) &&
        (flatRecordInheritanceRule.objectMetadataUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier ||
          flatRecordInheritanceRule.parentObjectMetadataUniversalIdentifier ===
            flatObjectMetadata.universalIdentifier)
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
