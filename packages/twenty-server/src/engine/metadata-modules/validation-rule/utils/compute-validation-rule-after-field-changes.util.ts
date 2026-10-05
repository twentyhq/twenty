import { type ValidationRuleBindings } from 'twenty-shared/types';

import { type ValidationRuleFieldChange } from 'src/engine/metadata-modules/validation-rule/types/validation-rule-field-change.type';

type ValidationRuleFieldChangeTarget = {
  bindings: ValidationRuleBindings;
  isActive: boolean;
  errorFieldMetadataUniversalIdentifier: string | null;
};

export const computeValidationRuleAfterFieldChanges = <
  TValidationRule extends ValidationRuleFieldChangeTarget,
>({
  validationRule,
  fieldChanges,
}: {
  validationRule: TValidationRule;
  fieldChanges: ValidationRuleFieldChange[];
}): TValidationRule => {
  const readFieldUniversalIdentifiers = new Set(
    Object.values(validationRule.bindings),
  );

  const shouldDisable = fieldChanges.some(({ fieldUniversalIdentifier }) =>
    readFieldUniversalIdentifiers.has(fieldUniversalIdentifier),
  );
  const shouldDetachErrorField = fieldChanges.some(
    (fieldChange) =>
      fieldChange.shouldDetachErrorField &&
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
