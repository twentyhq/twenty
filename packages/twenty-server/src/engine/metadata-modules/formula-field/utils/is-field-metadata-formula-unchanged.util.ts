import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
} from 'twenty-shared/utils';

export const isFieldMetadataFormulaUnchanged = ({
  formula,
  existingFormula,
}: {
  formula: unknown;
  existingFormula: unknown;
}): boolean =>
  getFieldMetadataFormulaExpression({ formula }) ===
    getFieldMetadataFormulaExpression({ formula: existingFormula }) &&
  getFieldMetadataFormulaCurrencyCodeExpression({ formula }) ===
    getFieldMetadataFormulaCurrencyCodeExpression({
      formula: existingFormula,
    });
