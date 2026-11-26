import { getFieldMetadataFormulaExpression } from '@/utils/formula/getFieldMetadataFormulaExpression';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { isDefined } from '@/utils/validation/isDefined';

// A formula is stored as a tree, and written as text that the server turns into one
export const isFormulaFieldMetadata = ({
  settings,
}: {
  settings?: unknown;
}): boolean =>
  isDefined(getFieldMetadataFormulaTree({ settings })) ||
  isDefined(getFieldMetadataFormulaExpression({ settings }));
