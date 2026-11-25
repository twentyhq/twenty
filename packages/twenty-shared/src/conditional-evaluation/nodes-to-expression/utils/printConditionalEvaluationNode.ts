import { isString } from '@sniptt/guards';

import { CONDITIONAL_AVAILABILITY_SYMBOL_BY_COMPARISON_OPERATOR } from '@/conditional-availability/constants/ConditionalAvailabilitySymbolByComparisonOperator';
import { type ConditionalAvailabilityLogicalOperator } from '@/conditional-availability/types/ConditionalAvailabilityLogicalOperator';
import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';

const BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN = /\\\\"$/;
const UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE = '\\u005c"';

const printConditionalAvailabilityText = ({ text }: { text: string }): string =>
  JSON.stringify(text).replace(
    BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN,
    UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE,
  );

const printInParentheses = (node: ConditionalAvailabilityNode): string =>
  `(${printConditionalAvailabilityNode({ node })})`;

const printOperand = (node: ConditionalAvailabilityNode): string =>
  node.type === 'COMPARISON' || node.type === 'GROUP'
    ? printInParentheses(node)
    : printConditionalAvailabilityNode({ node });

const printGroupChild = ({
  node,
  logicalOperator,
}: {
  node: ConditionalAvailabilityNode;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): string => {
  if (
    node.type === 'GROUP' &&
    node.children.length > 1 &&
    node.logicalOperator !== logicalOperator
  ) {
    return printInParentheses(node);
  }

  return printConditionalAvailabilityNode({ node });
};

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
    case 'VARIABLE':
      return node.path;
    case 'COMPARISON':
      return [
        printOperand(node.left),
        CONDITIONAL_AVAILABILITY_SYMBOL_BY_COMPARISON_OPERATOR[node.operator],
        printOperand(node.right),
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
      return `not ${printOperand(node.child)}`;
    case 'FUNCTION_CALL':
      return `${node.functionName}(${node.arguments
        .map((argumentNode) =>
          printConditionalAvailabilityNode({ node: argumentNode }),
        )
        .join(', ')})`;
  }
};
