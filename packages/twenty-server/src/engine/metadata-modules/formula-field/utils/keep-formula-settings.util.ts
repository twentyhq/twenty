import { type FieldMetadataFormula } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaExpression,
  isDefined,
} from 'twenty-shared/utils';

// Select and rating fields have no other setting, so anything else sent with them is dropped
export const keepFormulaSettings = (
  settings: unknown,
): { formula: FieldMetadataFormula } | null => {
  const expression = getFieldMetadataFormulaExpression({ settings });

  return isDefined(expression) ? { formula: { expression } } : null;
};
