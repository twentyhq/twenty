import { type ExpressionFieldNode } from '@/expression/types/ExpressionFieldNode';
import { listExpressionFieldNodes } from '@/utils/expression/listExpressionFieldNodes';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { isDefined } from '@/utils/validation/isDefined';

export const listFieldMetadataFormulaFieldNodes = ({
  settings,
}: {
  settings?: unknown;
}): ExpressionFieldNode[] =>
  [
    getFieldMetadataFormulaTree({ settings }),
    getFieldMetadataFormulaTree({ settings, isCurrencyCode: true }),
  ]
    .filter(isDefined)
    .flatMap(listExpressionFieldNodes);
