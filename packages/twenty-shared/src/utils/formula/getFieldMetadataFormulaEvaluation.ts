import { type FieldMetadataFormulaEvaluation } from '@/types/FieldMetadataFormulaEvaluation';
import { isFormulaFieldMetadata } from '@/utils/formula/isFormulaFieldMetadata';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export const getFieldMetadataFormulaEvaluation = ({
  settings,
}: {
  settings?: unknown;
}): FieldMetadataFormulaEvaluation | undefined => {
  if (
    !isPlainObject(settings) ||
    !isPlainObject(settings.formula) ||
    !isFormulaFieldMetadata({ settings })
  ) {
    return undefined;
  }

  return settings.formula.evaluation === 'STORED' ? 'STORED' : 'QUERY_TIME';
};
