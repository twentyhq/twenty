import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { expressionNodeSchema } from '@/expression/utils/expressionNodeSchema';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

// A stored tree is only read once it has the shape of an expression tree, so a malformed one reads as missing
export const getFieldMetadataFormulaTree = ({
  settings,
  isCurrencyCode = false,
}: {
  settings?: unknown;
  isCurrencyCode?: boolean;
}): ExpressionNode | undefined => {
  if (!isPlainObject(settings) || !isPlainObject(settings.formula)) {
    return undefined;
  }

  const parsing = expressionNodeSchema.safeParse(
    isCurrencyCode ? settings.formula.currencyCodeTree : settings.formula.tree,
  );

  return parsing.success ? parsing.data : undefined;
};
