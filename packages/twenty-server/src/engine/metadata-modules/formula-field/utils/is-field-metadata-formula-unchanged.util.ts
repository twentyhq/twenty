import isEqual from 'lodash.isequal';
import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  getFieldMetadataFormulaTree,
} from 'twenty-shared/utils';

const readFormula = (settings: unknown) => ({
  tree: getFieldMetadataFormulaTree({ settings }),
  currencyCodeTree: getFieldMetadataFormulaTree({
    settings,
    isCurrencyCode: true,
  }),
  expression: getFieldMetadataFormulaExpression({ settings }),
  currencyCodeExpression: getFieldMetadataFormulaCurrencyCodeExpression({
    settings,
  }),
});

export const isFieldMetadataFormulaUnchanged = ({
  settings,
  existingSettings,
}: {
  settings: unknown;
  existingSettings: unknown;
}): boolean => isEqual(readFormula(settings), readFormula(existingSettings));
