import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
} from 'twenty-shared/utils';

export const isFieldMetadataFormulaUnchanged = ({
  settings,
  existingSettings,
}: {
  settings: unknown;
  existingSettings: unknown;
}): boolean =>
  getFieldMetadataFormulaExpression({ settings }) ===
    getFieldMetadataFormulaExpression({ settings: existingSettings }) &&
  getFieldMetadataFormulaCurrencyCodeExpression({ settings }) ===
    getFieldMetadataFormulaCurrencyCodeExpression({
      settings: existingSettings,
    });
