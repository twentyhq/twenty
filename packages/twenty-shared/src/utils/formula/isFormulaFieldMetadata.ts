import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { isDefined } from '@/utils/validation/isDefined';

export const isFormulaFieldMetadata = ({
  settings,
}: {
  settings?: unknown;
}): boolean => isDefined(getFieldMetadataFormulaExpression({ settings }));
