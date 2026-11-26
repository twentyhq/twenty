import { type FieldMetadataFormula } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaExpression,
  getFieldMetadataFormulaTree,
  isDefined,
} from 'twenty-shared/utils';

// Select and rating fields have no other setting, so anything else sent with them is dropped
export const keepFormulaSettings = (
  settings: unknown,
): { formula: FieldMetadataFormula } | null => {
  const expression = getFieldMetadataFormulaExpression({ settings });
  const tree = getFieldMetadataFormulaTree({ settings });

  if (!isDefined(expression) && !isDefined(tree)) {
    return null;
  }

  return {
    formula: {
      ...(isDefined(expression) ? { expression } : {}),
      ...(isDefined(tree) ? { tree } : {}),
    },
  };
};
