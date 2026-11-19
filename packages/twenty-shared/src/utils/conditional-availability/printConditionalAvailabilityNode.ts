import { isString } from '@sniptt/guards';

import { CONDITIONAL_AVAILABILITY_COMPARISON_OPERATOR_SYMBOLS } from '@/constants/ConditionalAvailabilityComparisonOperatorSymbols';
import { type ConditionalAvailabilityLogicalOperator } from '@/types/ConditionalAvailabilityLogicalOperator';
import { type ConditionalAvailabilityNode } from '@/types/ConditionalAvailabilityNode';
import { printConditionalAvailabilityText } from '@/utils/conditional-availability/printConditionalAvailabilityText';

const printInParentheses = (node: ConditionalAvailabilityNode): string =>
  `(${printConditionalAvailabilityNode({ node })})`;

const printComparisonOperand = (node: ConditionalAvailabilityNode): string =>
  node.type === 'COMPARISON' || node.type === 'GROUP'
    ? printInParentheses(node)
    : printConditionalAvailabilityNode({ node });

const printGroupChild = ({
  node,
  logicalOperator,
}: {
  node: ConditionalAvailabilityNode;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): string =>
  node.type === 'GROUP' &&
  node.children.length > 1 &&
  node.logicalOperator !== logicalOperator
    ? printInParentheses(node)
    : printConditionalAvailabilityNode({ node });

export const printConditionalAvailabilityNode = ({
  node,
}: {
  node: ConditionalAvailabilityNode;
}): string => {
  switch (node.type) {
    case 'LITERAL':
      return isString(node.value)
        ? printConditionalAvailabilityText({ text: node.value })
        : String(node.value);
    case 'PATH':
      return node.path;
    case 'COMPARISON':
      return [
        printComparisonOperand(node.left),
        CONDITIONAL_AVAILABILITY_COMPARISON_OPERATOR_SYMBOLS[node.operator],
        printComparisonOperand(node.right),
      ].join(' ');
    case 'GROUP':
      return node.children
        .map((childNode) =>
          printGroupChild({
            node: childNode,
            logicalOperator: node.logicalOperator,
          }),
        )
        .join(node.logicalOperator === 'AND' ? ' and ' : ' or ');
    case 'NOT':
      return node.child.type === 'COMPARISON' || node.child.type === 'GROUP'
        ? `not ${printInParentheses(node.child)}`
        : `not ${printConditionalAvailabilityNode({ node: node.child })}`;
    case 'CALL':
      return `${node.functionName}(${node.arguments
        .map((argumentNode) =>
          printConditionalAvailabilityNode({ node: argumentNode }),
        )
        .join(', ')})`;
  }
};
