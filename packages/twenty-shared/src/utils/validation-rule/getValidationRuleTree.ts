import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { expressionNodeSchema } from '@/expression/utils/expressionNodeSchema';
import { type StoredExpressionTree } from '@/types/StoredExpressionTree';

export const getValidationRuleTree = ({
  tree,
}: {
  tree?: StoredExpressionTree | null;
}): ExpressionNode | undefined => {
  const parsing = expressionNodeSchema.safeParse(tree);

  return parsing.success ? parsing.data : undefined;
};
