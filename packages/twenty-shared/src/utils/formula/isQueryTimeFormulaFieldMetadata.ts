import { getFieldMetadataFormulaEvaluation } from '@/utils/formula/getFieldMetadataFormulaEvaluation';

export const isQueryTimeFormulaFieldMetadata = ({
  settings,
}: {
  settings?: unknown;
}): boolean => getFieldMetadataFormulaEvaluation({ settings }) === 'QUERY_TIME';
