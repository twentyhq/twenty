import { type ExpressionNode } from '@/types/ExpressionNode';
import { listExpressionFieldNodes } from '@/utils/expression/listExpressionFieldNodes';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { isDefined } from '@/utils/validation/isDefined';

export const listFieldMetadataFormulaFieldNodes = ({
  settings,
}: {
  settings?: unknown;
}): Extract<ExpressionNode, { type: 'FIELD' }>[] =>
  [
    getFieldMetadataFormulaTree({ settings }),
    getFieldMetadataFormulaTree({ settings, isCurrencyCode: true }),
  ]
    .filter(isDefined)
    .flatMap(listExpressionFieldNodes);
