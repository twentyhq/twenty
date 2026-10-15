/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { buildValidationRuleUpdatesAfterFieldChangesSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-validation-rule-updates-after-field-changes-side-effect.util';
import { getFlatValidationRulesAfterPendingOperations } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/get-flat-validation-rules-after-pending-operations.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { computeValidationRuleFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-field-changes.util';
import { findActiveValidationRuleBlockingFieldRename } from 'src/engine/metadata-modules/validation-rule/utils/find-active-validation-rule-blocking-field-rename.util';

@Injectable()
export class FieldValidationRulesOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldValidationRulesOnUpdate',
    description:
      'Keep object validation rules in step with a field they read, on any object: a rename rewrites the rule expression and its bindings to the new name, a type change or a deactivation disables the rules that read the field, and a deactivation moves errors shown on that field to the record level. A rename to a word reserved by the rule language fails while an active rule owned by the application making the change reads the field, since the rule could no longer reference it; rules owned by another application are disabled instead, so they cannot block that application.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const existingFlatFieldMetadata =
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.universalIdentifier
      ];

    if (
      isDefined(existingFlatFieldMetadata) &&
      existingFlatFieldMetadata.name !== flatFieldMetadata.name
    ) {
      const blockingValidationRule =
        findActiveValidationRuleBlockingFieldRename({
          validationRules: getFlatValidationRulesAfterPendingOperations({
            allFlatEntityOperationRecordByMetadataName,
            flatValidationRuleByUniversalIdentifier:
              relatedFlatEntityMaps.flatValidationRuleMaps
                .byUniversalIdentifier,
          }),
          fieldUniversalIdentifier: flatFieldMetadata.universalIdentifier,
          newFieldName: flatFieldMetadata.name,
          applicationUniversalIdentifier:
            context.buildOptions.applicationUniversalIdentifier,
        });

      if (isDefined(blockingValidationRule)) {
        const newFieldName = flatFieldMetadata.name;
        const validationRuleName = blockingValidationRule.name;

        return {
          status: 'fail',
          type: 'update',
          metadataName: 'fieldMetadata',
          flatEntityMinimalInformation: {
            universalIdentifier: flatFieldMetadata.universalIdentifier,
            name: newFieldName,
          } as Partial<MetadataFlatEntity<'fieldMetadata'>>,
          errors: [
            {
              code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
              message: t`"${newFieldName}" is a reserved word in validation rules and the rule "${validationRuleName}" reads this field`,
              userFriendlyMessage: msg`"${newFieldName}" is a reserved word in validation rules and the rule "${validationRuleName}" reads this field. Choose another name or update the rule first.`,
            },
          ],
        };
      }
    }

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
