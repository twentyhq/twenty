import { type ExpressionFieldNode } from '@/expression/types/ExpressionFieldNode';
import { type ExpressionNode } from '@/expression/types/ExpressionNode';

export const mapExpressionFieldNodes = ({
  node,
  mapFieldNode,
}: {
  node: ExpressionNode;
  mapFieldNode: (fieldNode: ExpressionFieldNode) => ExpressionNode;
}): ExpressionNode => {
  const map = (childNode: ExpressionNode) =>
    mapExpressionFieldNodes({ node: childNode, mapFieldNode });

  switch (node.type) {
    case 'LITERAL':
    case 'VARIABLE':
      return node;
    case 'FIELD':
      return mapFieldNode(node);
    case 'COMPARISON':
    case 'ARITHMETIC':
    case 'CONCATENATION':
      return { ...node, left: map(node.left), right: map(node.right) };
    case 'GROUP':
      return { ...node, children: node.children.map(map) };
    case 'NOT':
      return { ...node, child: map(node.child) };
    case 'UNARY':
      return { ...node, operand: map(node.operand) };
    case 'FUNCTION_CALL':
      return { ...node, arguments: node.arguments.map(map) };
    case 'LIST':
      return { ...node, items: node.items.map(map) };
    case 'IN':
      return { ...node, value: map(node.value), list: map(node.list) };
    case 'MEMBER':
      return { ...node, object: map(node.object) };
  }
};
