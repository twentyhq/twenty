import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { getFieldMetadataFormulaEvaluation } from '@/utils/formula/getFieldMetadataFormulaEvaluation';

export const isQueryTimeFormulaFieldMetadata = ({
  formula,
}: {
  formula?: Partial<FieldMetadataFormula> | null;
}): boolean => getFieldMetadataFormulaEvaluation({ formula }) === 'QUERY_TIME';
