import { isString } from '@sniptt/guards';

import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export const getFieldMetadataFormulaBindings = ({
  formula,
}: {
  formula?: Partial<Pick<FieldMetadataFormula, 'bindings'>> | null;
}): ValidationRuleBindings | undefined => {
  if (!isPlainObject(formula?.bindings)) {
    return undefined;
  }

  // The column is jsonb, so a malformed binding is dropped rather than trusted
  return Object.fromEntries(
    Object.entries(formula.bindings).filter(
      (binding): binding is [string, string] => isString(binding[1]),
    ),
  );
};
