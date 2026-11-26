import { type FieldMetadataFormulaEvaluation } from '@/types/FieldMetadataFormulaEvaluation';
import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation/isDefined';

export const getFieldMetadataFormulaEvaluation = ({
  formula,
}: {
  formula?: unknown;
}): FieldMetadataFormulaEvaluation | undefined => {
  if (
    !isPlainObject(formula) ||
    !isDefined(getFieldMetadataFormulaExpression({ formula }))
  ) {
    return undefined;
  }

  return formula.evaluation === 'STORED' ? 'STORED' : 'QUERY_TIME';
};
