/* @license Enterprise */

import { type StoredExpressionTree } from 'twenty-shared/types';
import {
  isDefined,
  isValidationRuleReservedName,
  listValidationRuleFieldNodes,
} from 'twenty-shared/utils';

import { type ValidationRuleFieldChange } from 'src/engine/metadata-modules/validation-rule/types/validation-rule-field-change.type';

type ValidationRuleFieldChangeTarget = {
  tree: StoredExpressionTree | null;
  isActive: boolean;
  errorFieldMetadataUniversalIdentifier: string | null;
};

type ValidationRuleFieldRead = {
  fieldUniversalIdentifier: string;
  isMember: boolean;
};

const listValidationRuleFieldReads = (
  tree: StoredExpressionTree | null,
): ValidationRuleFieldRead[] =>
  listValidationRuleFieldNodes({ tree }).flatMap(
    ({
      fieldUniversalIdentifier,
      relationFieldUniversalIdentifier,
      isPreviousValue,
    }) => [
      ...(isDefined(relationFieldUniversalIdentifier)
        ? [
            {
              fieldUniversalIdentifier: relationFieldUniversalIdentifier,
              isMember: false,
            },
          ]
        : []),
      {
        fieldUniversalIdentifier,
        isMember:
          isDefined(relationFieldUniversalIdentifier) ||
          isPreviousValue === true,
      },
    ],
  );

// The tree reads fields by identifier, so a rename only matters when the new name can't be printed back as a field
export const computeValidationRuleAfterFieldChanges = <
  TValidationRule extends ValidationRuleFieldChangeTarget,
>({
  validationRule,
  fieldChanges,
}: {
  validationRule: TValidationRule;
  fieldChanges: ValidationRuleFieldChange[];
}): TValidationRule => {
  const fieldReads = listValidationRuleFieldReads(validationRule.tree);

  const shouldDisable = fieldChanges.some(
    ({
      fieldUniversalIdentifier,
      newFieldName,
      shouldDisableRulesReadingField,
    }) =>
      fieldReads.some(
        (fieldRead) =>
          fieldRead.fieldUniversalIdentifier === fieldUniversalIdentifier &&
          (shouldDisableRulesReadingField ||
            (isDefined(newFieldName) &&
              isValidationRuleReservedName({
                name: newFieldName,
                isMember: fieldRead.isMember,
              }))),
      ),
  );
  const shouldDetachErrorField = fieldChanges.some(
    (fieldChange) =>
      fieldChange.isDeleted &&
      validationRule.errorFieldMetadataUniversalIdentifier ===
        fieldChange.fieldUniversalIdentifier,
  );

  let updatedValidationRule = validationRule;

  if (shouldDisable && updatedValidationRule.isActive) {
    updatedValidationRule = { ...updatedValidationRule, isActive: false };
  }

  if (shouldDetachErrorField) {
    updatedValidationRule = {
      ...updatedValidationRule,
      errorFieldMetadataUniversalIdentifier: null,
    };
  }

  return updatedValidationRule;
};
