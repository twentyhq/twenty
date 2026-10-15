/* @license Enterprise */

import { isValidationRuleReservedName } from 'twenty-shared/utils';

export const isValidationRuleBindingRenamedToReservedName = ({
  bindingPath,
  newFieldName,
}: {
  bindingPath: string;
  newFieldName: string;
}): boolean =>
  isValidationRuleReservedName({
    name: newFieldName,
    isMember: bindingPath.includes('.'),
  });
