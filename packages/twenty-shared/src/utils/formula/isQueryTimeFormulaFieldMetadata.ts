import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { getFieldMetadataFormulaEvaluation } from '@/utils/formula/getFieldMetadataFormulaEvaluation';

export const isQueryTimeFormulaFieldMetadata = ({
  formula,
}: {
  formula?: Partial<
    Pick<FieldMetadataFormula, 'expression' | 'evaluation'>
  > | null;
}): boolean => getFieldMetadataFormulaEvaluation({ formula }) === 'QUERY_TIME';
