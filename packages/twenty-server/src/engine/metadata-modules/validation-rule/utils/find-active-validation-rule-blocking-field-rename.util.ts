/* @license Enterprise */

import { type ValidationRuleBindings } from 'twenty-shared/types';

import { isValidationRuleBindingRenamedToReservedName } from 'src/engine/metadata-modules/validation-rule/utils/is-validation-rule-binding-renamed-to-reserved-name.util';

type ValidationRuleReadingFields = {
  bindings: ValidationRuleBindings;
  isActive: boolean;
  applicationUniversalIdentifier: string;
};

export const findActiveValidationRuleBlockingFieldRename = <
  TValidationRule extends ValidationRuleReadingFields,
>({
  validationRules,
  fieldUniversalIdentifier,
  newFieldName,
  applicationUniversalIdentifier,
}: {
  validationRules: TValidationRule[];
  fieldUniversalIdentifier: string;
  newFieldName: string;
  applicationUniversalIdentifier: string;
}): TValidationRule | undefined =>
  validationRules.find(
    (validationRule) =>
      validationRule.isActive &&
      validationRule.applicationUniversalIdentifier ===
        applicationUniversalIdentifier &&
      Object.entries(validationRule.bindings).some(
        ([bindingPath, boundUniversalIdentifier]) =>
          boundUniversalIdentifier === fieldUniversalIdentifier &&
          isValidationRuleBindingRenamedToReservedName({
            bindingPath,
            newFieldName,
          }),
      ),
  );
