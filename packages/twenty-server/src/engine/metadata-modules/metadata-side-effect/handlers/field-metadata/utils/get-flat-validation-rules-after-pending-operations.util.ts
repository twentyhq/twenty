/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';

export const getFlatValidationRulesAfterPendingOperations = ({
  allFlatEntityOperationRecordByMetadataName,
  flatValidationRuleByUniversalIdentifier,
}: {
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  flatValidationRuleByUniversalIdentifier: Partial<
    Record<string, UniversalFlatValidationRule>
  >;
}): UniversalFlatValidationRule[] => {
  const validationRuleOperations =
    allFlatEntityOperationRecordByMetadataName.validationRule;
  const deletedFlatObjectMetadatas =
    allFlatEntityOperationRecordByMetadataName.objectMetadata
      ?.flatEntityToDelete ?? {};

  return Object.values(flatValidationRuleByUniversalIdentifier)
    .filter(isDefined)
    .filter(
      ({ universalIdentifier, objectMetadataUniversalIdentifier }) =>
        !isDefined(
          validationRuleOperations?.flatEntityToDelete[universalIdentifier],
        ) &&
        !isDefined(
          deletedFlatObjectMetadatas[objectMetadataUniversalIdentifier],
        ),
    )
    .map(
      (existingFlatValidationRule) =>
        validationRuleOperations?.flatEntityToUpdate[
          existingFlatValidationRule.universalIdentifier
        ] ?? existingFlatValidationRule,
    );
};
