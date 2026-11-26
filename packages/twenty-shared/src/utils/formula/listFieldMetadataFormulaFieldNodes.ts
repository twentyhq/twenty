import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';
import { type ExpressionFieldNode } from '@/expression/types/ExpressionFieldNode';
import { listExpressionFieldNodes } from '@/utils/expression/listExpressionFieldNodes';
import { getFieldMetadataFormulaTree } from '@/utils/formula/getFieldMetadataFormulaTree';
import { isDefined } from '@/utils/validation/isDefined';

export const listFieldMetadataFormulaFieldNodes = ({
  formula,
}: {
  formula?: Partial<FieldMetadataFormula> | null;
}): ExpressionFieldNode[] =>
  [
    getFieldMetadataFormulaTree({ formula }),
    getFieldMetadataFormulaTree({ formula, isCurrencyCode: true }),
  ]
    .filter(isDefined)
    .flatMap(listExpressionFieldNodes);
