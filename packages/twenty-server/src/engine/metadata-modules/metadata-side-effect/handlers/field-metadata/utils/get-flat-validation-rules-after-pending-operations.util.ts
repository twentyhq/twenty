/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';

type ValidationRuleOfObject = Pick<
  UniversalFlatValidationRule,
  'universalIdentifier' | 'objectMetadataUniversalIdentifier'
>;

export const getFlatValidationRulesAfterPendingOperations = <
  TValidationRule extends ValidationRuleOfObject,
>({
  flatValidationRuleByUniversalIdentifier,
  flatValidationRuleToUpdateByUniversalIdentifier = {},
  flatValidationRuleToDeleteByUniversalIdentifier = {},
  flatObjectMetadataToDeleteByUniversalIdentifier = {},
}: {
  flatValidationRuleByUniversalIdentifier: Partial<
    Record<string, TValidationRule>
  >;
  flatValidationRuleToUpdateByUniversalIdentifier?: Partial<
    Record<string, TValidationRule>
  >;
  flatValidationRuleToDeleteByUniversalIdentifier?: Partial<
    Record<string, unknown>
  >;
  flatObjectMetadataToDeleteByUniversalIdentifier?: Partial<
    Record<string, unknown>
  >;
}): TValidationRule[] =>
  Object.values(flatValidationRuleByUniversalIdentifier)
    .filter(isDefined)
    .filter(
      ({ universalIdentifier, objectMetadataUniversalIdentifier }) =>
        !isDefined(
          flatValidationRuleToDeleteByUniversalIdentifier[universalIdentifier],
        ) &&
        !isDefined(
          flatObjectMetadataToDeleteByUniversalIdentifier[
            objectMetadataUniversalIdentifier
          ],
        ),
    )
    .map(
      (existingFlatValidationRule) =>
        flatValidationRuleToUpdateByUniversalIdentifier[
          existingFlatValidationRule.universalIdentifier
        ] ?? existingFlatValidationRule,
    );
