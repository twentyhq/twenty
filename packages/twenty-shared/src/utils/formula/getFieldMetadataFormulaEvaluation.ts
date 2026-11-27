import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { type FieldMetadataFormulaEvaluation } from '@/types/FieldMetadataFormulaEvaluation';
import { isFormulaFieldMetadata } from '@/utils/formula/isFormulaFieldMetadata';

export const getFieldMetadataFormulaEvaluation = ({
  formula,
}: {
  formula?: Partial<
    Pick<FieldMetadataFormula, 'expression' | 'tree' | 'evaluation'>
  > | null;
}): FieldMetadataFormulaEvaluation | undefined => {
  if (!isFormulaFieldMetadata({ formula })) {
    return undefined;
  }

  return formula?.evaluation === 'STORED' ? 'STORED' : 'QUERY_TIME';
};
