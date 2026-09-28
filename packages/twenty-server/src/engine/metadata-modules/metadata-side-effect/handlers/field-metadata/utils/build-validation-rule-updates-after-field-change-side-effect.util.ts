import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import {
  computeValidationRuleAfterFieldChange,
  type ValidationRuleFieldChange,
} from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-change.util';
import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';

export const buildValidationRuleUpdatesAfterFieldChangeSideEffect = ({
  fieldChange,
  allFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps,
}: {
  fieldChange: ValidationRuleFieldChange;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  relatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<'fieldMetadata'>;
}): MetadataSideEffectResult => {
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

    const updatedFlatValidationRule = computeValidationRuleAfterFieldChange({
      validationRule: flatValidationRule,
      fieldChange,
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
