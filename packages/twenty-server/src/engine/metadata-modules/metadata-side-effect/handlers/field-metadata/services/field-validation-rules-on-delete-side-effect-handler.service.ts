import { Injectable } from '@nestjs/common';

import { buildValidationRuleUpdatesAfterFieldChangeSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-validation-rule-updates-after-field-change-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldValidationRulesOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldValidationRulesOnDelete',
    description:
      'When a field is deleted, disable every object validation rule that reads it, on any object, and move errors shown on that field to the record level, so no write is blocked by a rule that can no longer be evaluated.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    return buildValidationRuleUpdatesAfterFieldChangeSideEffect({
      fieldChange: {
        fieldUniversalIdentifier: flatFieldMetadata.universalIdentifier,
        newFieldName: null,
        shouldDisableRulesReadingField: true,
        shouldDetachErrorField: true,
      },
      allFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps,
    });
  }
}
