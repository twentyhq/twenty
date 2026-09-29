import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class ObjectValidationRulesOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'objectMetadata',
    name: 'objectValidationRulesOnDelete',
    description:
      'When an object is deleted, delete every validation rule defined on it, whichever application authored the rule, so the rules leave the metadata cache in the same migration that drops their object.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const validationRulesToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'validationRule'>
    > = {};

    for (const flatValidationRule of Object.values(
      relatedFlatEntityMaps.flatValidationRuleMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(flatValidationRule) &&
        flatValidationRule.objectMetadataUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier
      ) {
        validationRulesToDelete[flatValidationRule.universalIdentifier] =
          flatValidationRule;
      }
    }

    if (Object.keys(validationRulesToDelete).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        validationRule: { flatEntityToDelete: validationRulesToDelete },
      },
    };
  }
}
