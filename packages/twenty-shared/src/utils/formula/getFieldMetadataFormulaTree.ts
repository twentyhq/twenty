import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { expressionNodeSchema } from '@/expression/utils/expressionNodeSchema';
import { type FieldMetadataFormula } from '@/types/FieldMetadataFormula';

// A stored tree is only read once it has the shape of an expression tree, so a malformed one reads as missing
export const getFieldMetadataFormulaTree = ({
  formula,
  isCurrencyCode = false,
}: {
  formula?: Partial<
    Pick<FieldMetadataFormula, 'tree' | 'currencyCodeTree'>
  > | null;
  isCurrencyCode?: boolean;
}): ExpressionNode | undefined => {
  const parsing = expressionNodeSchema.safeParse(
    isCurrencyCode ? formula?.currencyCodeTree : formula?.tree,
  );

  return parsing.success ? parsing.data : undefined;
};
