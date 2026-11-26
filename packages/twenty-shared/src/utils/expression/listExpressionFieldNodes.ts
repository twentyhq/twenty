import { type ExpressionFieldNode } from '@/expression/types/ExpressionFieldNode';
import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { getExpressionNodeChildren } from '@/expression/utils/internal/getExpressionNodeChildren';

export const listExpressionFieldNodes = (
  node: ExpressionNode,
): ExpressionFieldNode[] =>
  node.type === 'FIELD'
    ? [node]
    : getExpressionNodeChildren(node).flatMap(listExpressionFieldNodes);
