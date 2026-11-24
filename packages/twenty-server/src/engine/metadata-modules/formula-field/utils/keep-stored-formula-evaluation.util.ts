import { type FieldMetadataFormula } from 'twenty-shared/types';

// Only STORED is written, a missing evaluation meaning QUERY_TIME
export const keepStoredFormulaEvaluation = (
  evaluation: FieldMetadataFormula['evaluation'],
): Pick<FieldMetadataFormula, 'evaluation'> =>
  evaluation === 'STORED' ? { evaluation } : {};
