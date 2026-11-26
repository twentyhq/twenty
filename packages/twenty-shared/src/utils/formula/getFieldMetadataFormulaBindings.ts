import { isString } from '@sniptt/guards';

import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export const getFieldMetadataFormulaBindings = ({
  formula,
}: {
  formula?: unknown;
}): ValidationRuleBindings | undefined => {
  if (!isPlainObject(formula) || !isPlainObject(formula.bindings)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(formula.bindings).filter(
      (binding): binding is [string, string] => isString(binding[1]),
    ),
  );
};
