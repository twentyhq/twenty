import { type ExpressionFieldNode } from '@/expression/types/ExpressionFieldNode';
import { type StoredExpressionTree } from '@/types/StoredExpressionTree';
import { listExpressionFieldNodes } from '@/utils/expression/listExpressionFieldNodes';
import { isDefined } from '@/utils/validation/isDefined';
import { getValidationRuleTree } from '@/utils/validation-rule/getValidationRuleTree';

export const listValidationRuleFieldNodes = ({
  tree,
}: {
  tree?: StoredExpressionTree | null;
}): ExpressionFieldNode[] => {
  const validationRuleTree = getValidationRuleTree({ tree });

  return isDefined(validationRuleTree)
    ? listExpressionFieldNodes(validationRuleTree)
    : [];
};
