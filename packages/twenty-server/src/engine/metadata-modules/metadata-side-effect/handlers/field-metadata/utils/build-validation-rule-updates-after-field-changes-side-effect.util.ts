/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { buildReservedFieldNameValidationRuleFailure } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-reserved-field-name-validation-rule-failure.util';
import { getFlatValidationRulesAfterPendingOperations } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/get-flat-validation-rules-after-pending-operations.util';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { computeValidationRuleAfterFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-changes.util';
import { computeValidationRuleFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-field-changes.util';
import { findActiveValidationRuleBlockingFieldRename } from 'src/engine/metadata-modules/validation-rule/utils/find-active-validation-rule-blocking-field-rename.util';
import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';

export const buildValidationRuleUpdatesAfterFieldChangesSideEffect = ({
  allFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps,
  applicationUniversalIdentifier,
}: {
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  relatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<'fieldMetadata'>;
  applicationUniversalIdentifier: string;
}): MetadataSideEffectResult => {
  const fieldOperations =
    allFlatEntityOperationRecordByMetadataName.fieldMetadata;
  const fieldChanges = computeValidationRuleFieldChanges({
    updatedFields: Object.values(
      fieldOperations?.flatEntityToUpdate ?? {},
    ).filter(isDefined),
    deletedFields: Object.values(
      fieldOperations?.flatEntityToDelete ?? {},
    ).filter(isDefined),
    existingFieldByUniversalIdentifier:
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  });

  if (fieldChanges.length === 0) {
    return { status: 'noop' };
  }

  const flatValidationRules =
    getFlatValidationRulesAfterPendingOperations<UniversalFlatValidationRule>({
      flatValidationRuleByUniversalIdentifier:
        relatedFlatEntityMaps.flatValidationRuleMaps.byUniversalIdentifier,
      flatValidationRuleToUpdateByUniversalIdentifier:
        allFlatEntityOperationRecordByMetadataName.validationRule
          ?.flatEntityToUpdate,
      flatValidationRuleToDeleteByUniversalIdentifier:
        allFlatEntityOperationRecordByMetadataName.validationRule
          ?.flatEntityToDelete,
      flatObjectMetadataToDeleteByUniversalIdentifier:
        allFlatEntityOperationRecordByMetadataName.objectMetadata
          ?.flatEntityToDelete,
    });

  for (const { fieldUniversalIdentifier, newFieldName } of fieldChanges) {
    if (!isDefined(newFieldName)) {
      continue;
    }

    const blockingValidationRule = findActiveValidationRuleBlockingFieldRename({
      validationRules: flatValidationRules,
      fieldUniversalIdentifier,
      newFieldName,
      applicationUniversalIdentifier,
    });

    if (isDefined(blockingValidationRule)) {
      return buildReservedFieldNameValidationRuleFailure({
        fieldUniversalIdentifier,
        newFieldName,
        validationRuleName: blockingValidationRule.name,
      });
    }
  }

  const flatValidationRuleToUpdate: Record<
    string,
    UniversalFlatValidationRule
  > = {};

  for (const flatValidationRule of flatValidationRules) {
    const updatedFlatValidationRule = computeValidationRuleAfterFieldChanges({
      validationRule: flatValidationRule,
      fieldChanges,
    });

    if (updatedFlatValidationRule !== flatValidationRule) {
      flatValidationRuleToUpdate[flatValidationRule.universalIdentifier] =
        updatedFlatValidationRule;
    }
  }

  if (Object.keys(flatValidationRuleToUpdate).length === 0) {
    return { status: 'noop' };
  }

  return {
    status: 'success',
    operations: {
      validationRule: { flatEntityToUpdate: flatValidationRuleToUpdate },
    },
  };
};
