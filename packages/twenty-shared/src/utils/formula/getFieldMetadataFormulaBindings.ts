import { isString } from '@sniptt/guards';

import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export const getFieldMetadataFormulaBindings = ({
  settings,
}: {
  settings?: unknown;
}): ValidationRuleBindings | undefined => {
  if (!isPlainObject(settings) || !isPlainObject(settings.formula)) {
    return undefined;
  }

  const bindings = settings.formula.bindings;

  if (!isPlainObject(bindings)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(bindings).filter((binding): binding is [string, string] =>
      isString(binding[1]),
    ),
  );
};
