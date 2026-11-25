import { type FieldMetadataFormulaEvaluation } from '@/types/FieldMetadataFormulaEvaluation';
import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation/isDefined';

export const getFieldMetadataFormulaEvaluation = ({
  settings,
}: {
  settings?: unknown;
}): FieldMetadataFormulaEvaluation | undefined => {
  if (
    !isPlainObject(settings) ||
    !isPlainObject(settings.formula) ||
    !isDefined(getFieldMetadataFormulaExpression({ settings }))
  ) {
    return undefined;
  }

  return settings.formula.evaluation === 'STORED' ? 'STORED' : 'QUERY_TIME';
};
