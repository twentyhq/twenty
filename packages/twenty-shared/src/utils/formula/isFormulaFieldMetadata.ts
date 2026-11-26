import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { isDefined } from '@/utils/validation/isDefined';

export const isFormulaFieldMetadata = ({
  settings,
}: {
  settings?: unknown;
}): boolean =>
  isDefined(getFieldMetadataFormulaTree({ settings })) ||
  isDefined(getFieldMetadataFormulaExpression({ settings }));
