import { type FieldMetadataFormula } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
} from 'twenty-shared/utils';

export const omitFormulaFieldBindings = (
  formula: FieldMetadataFormula | null,
): FieldMetadataFormula | null => {
  const expression = getFieldMetadataFormulaExpression({ formula });

  if (!isDefined(expression)) {
    return null;
  }

  const currencyCodeExpression = getFieldMetadataFormulaCurrencyCodeExpression({
    formula,
  });

  return {
    expression,
    ...(isDefined(currencyCodeExpression) ? { currencyCodeExpression } : {}),
  };
};
