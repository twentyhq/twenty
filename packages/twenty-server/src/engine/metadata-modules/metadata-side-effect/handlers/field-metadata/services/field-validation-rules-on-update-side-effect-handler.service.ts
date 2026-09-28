import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildValidationRulesAfterFieldChangeSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-validation-rules-after-field-change-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldValidationRulesOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldValidationRulesOnUpdate',
    description:
      'Keep object validation rules in step with a field they read, on any object: a rename rewrites the rule expression and its bindings to the new name, a type change or a deactivation disables the rules that read the field, and a deactivation moves errors shown on that field to the record level.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const existingFlatFieldMetadata =
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.universalIdentifier
      ];

    if (!isDefined(existingFlatFieldMetadata)) {
      return { status: 'noop' };
    }

    const isRenamed = existingFlatFieldMetadata.name !== flatFieldMetadata.name;
    const isRetyped = existingFlatFieldMetadata.type !== flatFieldMetadata.type;
    const isDeactivated =
      existingFlatFieldMetadata.isActive && !flatFieldMetadata.isActive;

    if (!isRenamed && !isRetyped && !isDeactivated) {
      return { status: 'noop' };
    }

    return buildValidationRulesAfterFieldChangeSideEffect({
      fieldChange: {
        fieldUniversalIdentifier: flatFieldMetadata.universalIdentifier,
        fieldMetadataId: existingFlatFieldMetadata.id,
        newFieldName: isRenamed ? flatFieldMetadata.name : null,
        shouldDisableRulesReadingField: isRetyped || isDeactivated,
        shouldDetachErrorField: isDeactivated,
      },
      allFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps,
    });
  }
}
