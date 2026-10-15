/* @license Enterprise */

import { type ValidationRuleBindings } from 'twenty-shared/types';
import { isValidationRuleReservedName } from 'twenty-shared/utils';

type ValidationRuleReadingFields = {
  bindings: ValidationRuleBindings;
  isActive: boolean;
};

export const findActiveValidationRuleBlockingFieldRename = <
  TValidationRule extends ValidationRuleReadingFields,
>({
  validationRules,
  fieldUniversalIdentifier,
  newFieldName,
}: {
  validationRules: TValidationRule[];
  fieldUniversalIdentifier: string;
  newFieldName: string;
}): TValidationRule | undefined =>
  validationRules.find(
    (validationRule) =>
      validationRule.isActive &&
      Object.entries(validationRule.bindings).some(
        ([path, boundUniversalIdentifier]) =>
          boundUniversalIdentifier === fieldUniversalIdentifier &&
          isValidationRuleReservedName({
            name: newFieldName,
            isMember: path.includes('.'),
          }),
      ),
  );
