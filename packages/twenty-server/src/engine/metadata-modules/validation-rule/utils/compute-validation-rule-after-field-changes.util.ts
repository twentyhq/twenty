import {
  computeValidationRuleAfterFieldChange,
  type ValidationRuleFieldChange,
  type ValidationRuleFieldChangeTarget,
} from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-after-field-change.util';

export const computeValidationRuleAfterFieldChanges = <
  TValidationRule extends ValidationRuleFieldChangeTarget,
>({
  validationRule,
  fieldChanges,
}: {
  validationRule: TValidationRule;
  fieldChanges: ValidationRuleFieldChange[];
}): TValidationRule =>
  fieldChanges.reduce(
    (updatedValidationRule, fieldChange) =>
      computeValidationRuleAfterFieldChange({
        validationRule: updatedValidationRule,
        fieldChange,
      }),
    validationRule,
  );
