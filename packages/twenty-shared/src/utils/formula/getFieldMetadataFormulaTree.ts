import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { parseStoredExpressionTree } from '@/expression/utils/parseStoredExpressionTree';
import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';

export const getFieldMetadataFormulaTree = ({
  formula,
  isCurrencyCode = false,
}: {
  formula?: Partial<
    Pick<FieldMetadataFormula, 'tree' | 'currencyCodeTree'>
  > | null;
  isCurrencyCode?: boolean;
}): ExpressionNode | undefined =>
  parseStoredExpressionTree({
    tree: isCurrencyCode ? formula?.currencyCodeTree : formula?.tree,
  });
