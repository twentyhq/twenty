import { Injectable } from '@nestjs/common';

import { buildValidationRuleUpdatesAfterFieldChangesSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-validation-rule-updates-after-field-changes-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { computeValidationRuleFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-field-changes.util';

@Injectable()
export class FieldValidationRulesOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldValidationRulesOnUpdate',
    description:
      'Keep object validation rules in step with a field they read, on any object: a type change or a deactivation disables the rules that read the field, and a deactivation moves errors shown on that field to the record level. A rename leaves rules untouched, since they bind fields by universal identifier.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const triggerFieldChanges = computeValidationRuleFieldChanges({
      updatedFields: [flatFieldMetadata],
      deletedFields: [],
      existingFieldByUniversalIdentifier:
        relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    });

    if (triggerFieldChanges.length === 0) {
      return { status: 'noop' };
    }

    return buildValidationRuleUpdatesAfterFieldChangesSideEffect({
      allFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps,
    });
  }
}
