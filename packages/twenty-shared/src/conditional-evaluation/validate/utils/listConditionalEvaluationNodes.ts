import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';

const getChildNodes = (
  node: ConditionalEvaluationNode,
): ConditionalEvaluationNode[] => {
  switch (node.type) {
    case 'LITERAL':
    case 'VARIABLE':
      return [];
    case 'COMPARISON':
      return [node.left, node.right];
    case 'GROUP':
      return node.children;
    case 'NOT':
      return [node.child];
    case 'FUNCTION_CALL':
      return node.arguments;
  }
};

export const listConditionalEvaluationNodes = ({
  node,
}: {
  node: ConditionalEvaluationNode;
}): ConditionalEvaluationNode[] => [
  node,
  ...getChildNodes(node).flatMap((childNode) =>
    listConditionalEvaluationNodes({ node: childNode }),
  ),
];
