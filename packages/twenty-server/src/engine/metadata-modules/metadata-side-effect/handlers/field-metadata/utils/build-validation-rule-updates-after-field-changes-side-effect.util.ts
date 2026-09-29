import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { computeValidationRuleAfterFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-changes.util';
import { computeValidationRuleFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-field-changes.util';
import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';

export const buildValidationRuleUpdatesAfterFieldChangesSideEffect = ({
  allFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps,
}: {
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  relatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<'fieldMetadata'>;
}): MetadataSideEffectResult => {
  const fieldOperations =
    allFlatEntityOperationRecordByMetadataName.fieldMetadata;
  const fieldChanges = computeValidationRuleFieldChanges({
    updatedFields: Object.values(fieldOperations?.flatEntityToUpdate ?? {}),
    deletedFields: Object.values(fieldOperations?.flatEntityToDelete ?? {}),
    existingFieldByUniversalIdentifier:
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  });

  if (fieldChanges.length === 0) {
    return { status: 'noop' };
  }

  const validationRuleOperations =
    allFlatEntityOperationRecordByMetadataName.validationRule;
  const deletedFlatObjectMetadatas =
    allFlatEntityOperationRecordByMetadataName.objectMetadata
      ?.flatEntityToDelete ?? {};

  const flatValidationRuleToUpdate: Record<
    string,
    UniversalFlatValidationRule
  > = {};

  for (const existingFlatValidationRule of Object.values(
    relatedFlatEntityMaps.flatValidationRuleMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(existingFlatValidationRule)) {
      continue;
    }

    const { universalIdentifier, objectMetadataUniversalIdentifier } =
      existingFlatValidationRule;

    if (
      isDefined(
        validationRuleOperations?.flatEntityToDelete[universalIdentifier],
      ) ||
      isDefined(deletedFlatObjectMetadatas[objectMetadataUniversalIdentifier])
    ) {
      continue;
    }

    const flatValidationRule: UniversalFlatValidationRule =
      validationRuleOperations?.flatEntityToUpdate[universalIdentifier] ??
      existingFlatValidationRule;

    const updatedFlatValidationRule = computeValidationRuleAfterFieldChanges({
      validationRule: flatValidationRule,
      fieldChanges,
    });

    if (updatedFlatValidationRule !== flatValidationRule) {
      flatValidationRuleToUpdate[universalIdentifier] =
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
