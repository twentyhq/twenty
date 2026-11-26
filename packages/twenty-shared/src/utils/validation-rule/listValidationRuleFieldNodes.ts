import { type ExpressionFieldNode } from '@/expression/types/ExpressionFieldNode';
import { parseStoredExpressionTree } from '@/expression/utils/parseStoredExpressionTree';
import { type StoredExpressionTree } from '@/types/StoredExpressionTree';
import { listExpressionFieldNodes } from '@/utils/expression/listExpressionFieldNodes';
import { isDefined } from '@/utils/validation/isDefined';

export const listValidationRuleFieldNodes = ({
  tree,
}: {
  tree?: StoredExpressionTree | null;
}): ExpressionFieldNode[] => {
  const validationRuleTree = parseStoredExpressionTree({ tree });

  return isDefined(validationRuleTree)
    ? listExpressionFieldNodes(validationRuleTree)
    : [];
};
