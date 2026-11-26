import { type ExpressionNode } from '@/types/ExpressionNode';
import { getExpressionNodeChildren } from '@/utils/expression/internal/getExpressionNodeChildren';

type FieldNode = Extract<ExpressionNode, { type: 'FIELD' }>;

export const listExpressionFieldNodes = (node: ExpressionNode): FieldNode[] =>
  node.type === 'FIELD'
    ? [node]
    : getExpressionNodeChildren(node).flatMap(listExpressionFieldNodes);
