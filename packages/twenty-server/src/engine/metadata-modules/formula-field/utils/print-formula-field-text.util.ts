import {
  type FieldMetadataFormula,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { isDefined, printFieldMetadataFormula } from 'twenty-shared/utils';

// Manifests and AI tools show a formula as text, so its stored trees are printed with the current field names
export const printFormulaFieldText = ({
  formula,
  fields,
}: {
  formula: FieldMetadataFormula | null;
  fields: ValidationRuleFieldDescriptor[];
}): FieldMetadataFormula | null => {
  const { expression, currencyCodeExpression } = printFieldMetadataFormula({
    formula,
    fields,
  });

  if (!isDefined(expression)) {
    return null;
  }

  return {
    expression,
    ...(isDefined(currencyCodeExpression) ? { currencyCodeExpression } : {}),
  };
};
