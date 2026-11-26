import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { isDefined } from '@/utils/validation/isDefined';

export const isFormulaFieldMetadata = ({
  formula,
}: {
  formula?: unknown;
}): boolean => isDefined(getFieldMetadataFormulaExpression({ formula }));
