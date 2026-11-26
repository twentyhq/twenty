import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { type FieldMetadataFormulaEvaluation } from '@/types/FieldMetadataFormulaEvaluation';
import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { isDefined } from '@/utils/validation/isDefined';

export const getFieldMetadataFormulaEvaluation = ({
  formula,
}: {
  formula?: Partial<FieldMetadataFormula> | null;
}): FieldMetadataFormulaEvaluation | undefined => {
  if (!isDefined(getFieldMetadataFormulaExpression({ formula }))) {
    return undefined;
  }

  return formula?.evaluation === 'STORED' ? 'STORED' : 'QUERY_TIME';
};
