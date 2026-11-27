import isEqual from 'lodash.isequal';
import { type FieldMetadataFormula } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  getFieldMetadataFormulaTree,
} from 'twenty-shared/utils';

type ComparedFormula =
  | Partial<
      Pick<
        FieldMetadataFormula,
        'tree' | 'currencyCodeTree' | 'expression' | 'currencyCodeExpression'
      >
    >
  | null
  | undefined;

const readFormula = (formula: ComparedFormula) => ({
  tree: getFieldMetadataFormulaTree({ formula }),
  currencyCodeTree: getFieldMetadataFormulaTree({
    formula,
    isCurrencyCode: true,
  }),
  expression: getFieldMetadataFormulaExpression({ formula }),
  currencyCodeExpression: getFieldMetadataFormulaCurrencyCodeExpression({
    formula,
  }),
});

export const isFieldMetadataFormulaUnchanged = ({
  formula,
  existingFormula,
}: {
  formula: ComparedFormula;
  existingFormula: ComparedFormula;
}): boolean => isEqual(readFormula(formula), readFormula(existingFormula));
