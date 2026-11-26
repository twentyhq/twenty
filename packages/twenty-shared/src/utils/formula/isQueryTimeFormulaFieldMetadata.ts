import { getFieldMetadataFormulaEvaluation } from '@/utils/formula/getFieldMetadataFormulaEvaluation';

export const isQueryTimeFormulaFieldMetadata = ({
  formula,
}: {
  formula?: unknown;
}): boolean => getFieldMetadataFormulaEvaluation({ formula }) === 'QUERY_TIME';
