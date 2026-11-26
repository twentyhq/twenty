import { type ExpressionNode } from '@/expression/types/ExpressionNode';

export const getExpressionNodeChildren = (
  node: ExpressionNode,
): ExpressionNode[] => {
  switch (node.type) {
    case 'LITERAL':
    case 'VARIABLE':
      return [];
    case 'COMPARISON':
    case 'ARITHMETIC':
    case 'CONCATENATION':
      return [node.left, node.right];
    case 'GROUP':
      return node.children;
    case 'NOT':
      return [node.child];
    case 'MEMBER':
      return [node.object];
    case 'UNARY':
      return [node.operand];
    case 'FUNCTION_CALL':
      return node.arguments;
    case 'LIST':
      return node.items;
    case 'IN':
      return [node.value, node.list];
  }
};
