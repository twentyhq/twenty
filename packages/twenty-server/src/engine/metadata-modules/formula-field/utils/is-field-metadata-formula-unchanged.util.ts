import { type FieldMetadataFormula } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
} from 'twenty-shared/utils';

export const isFieldMetadataFormulaUnchanged = ({
  formula,
  existingFormula,
}: {
  formula:
    | Partial<
        Pick<FieldMetadataFormula, 'expression' | 'currencyCodeExpression'>
      >
    | null
    | undefined;
  existingFormula:
    | Partial<
        Pick<FieldMetadataFormula, 'expression' | 'currencyCodeExpression'>
      >
    | null
    | undefined;
}): boolean =>
  getFieldMetadataFormulaExpression({ formula }) ===
    getFieldMetadataFormulaExpression({ formula: existingFormula }) &&
  getFieldMetadataFormulaCurrencyCodeExpression({ formula }) ===
    getFieldMetadataFormulaCurrencyCodeExpression({
      formula: existingFormula,
    });
