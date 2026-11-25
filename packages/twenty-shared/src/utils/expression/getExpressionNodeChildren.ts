import { type ExpressionNode } from '@/types/ExpressionNode';

export const getExpressionNodeChildren = (
  node: ExpressionNode,
): ExpressionNode[] => {
  switch (node.kind) {
    case 'list':
      return node.items;
    case 'unary':
      return [node.operand];
    case 'binary':
      return [node.left, node.right];
    case 'call':
      return node.arguments;
    default:
      return [];
  }
};
