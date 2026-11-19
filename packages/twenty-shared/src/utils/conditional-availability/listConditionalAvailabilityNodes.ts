import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';

const getChildNodes = (
  node: ConditionalAvailabilityNode,
): ConditionalAvailabilityNode[] => {
  switch (node.type) {
    case 'LITERAL':
    case 'PATH':
    case 'SELECTED_RECORDS':
      return [];
    case 'COMPARISON':
      return [node.left, node.right];
    case 'GROUP':
      return node.children;
    case 'NOT':
      return [node.child];
    case 'CALL':
      return node.arguments;
  }
};

export const listConditionalAvailabilityNodes = ({
  node,
}: {
  node: ConditionalAvailabilityNode;
}): ConditionalAvailabilityNode[] => [
  node,
  ...getChildNodes(node).flatMap((childNode) =>
    listConditionalAvailabilityNodes({ node: childNode }),
  ),
];
