import { type ConditionalAvailabilityLogicalOperator } from '@/conditional-availability/types/ConditionalAvailabilityLogicalOperator';
import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';
import { isDefined } from '@/utils/validation/isDefined';

export const joinConditionalAvailabilityNodes = ({
  nodes,
  logicalOperator,
}: {
  nodes: ConditionalAvailabilityNode[];
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): ConditionalAvailabilityNode => {
  const [onlyNode] = nodes;

  if (nodes.length === 1 && isDefined(onlyNode)) {
    return onlyNode;
  }

  return {
    type: 'GROUP',
    logicalOperator,
    children: nodes.flatMap((node) =>
      node.type === 'GROUP' && node.logicalOperator === logicalOperator
        ? node.children
        : [node],
    ),
  };
};
