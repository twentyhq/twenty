import { isString } from '@sniptt/guards';

import { CONDITIONAL_EVALUATION_SYMBOL_BY_COMPARISON_OPERATOR } from '@/conditional-evaluation/common/constants/ConditionalEvaluationSymbolByComparisonOperator';
import { type ConditionalEvaluationLogicalOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationLogicalOperator';
import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';

const BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN = /\\\\"$/;
const UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE = '\\u005c"';

const printConditionalEvaluationText = ({ text }: { text: string }): string =>
  JSON.stringify(text).replace(
    BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN,
    UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE,
  );

const printInParentheses = (node: ConditionalEvaluationNode): string =>
  `(${printConditionalEvaluationNode({ node })})`;

const printOperand = (node: ConditionalEvaluationNode): string =>
  node.type === 'COMPARISON' || node.type === 'GROUP'
    ? printInParentheses(node)
    : printConditionalEvaluationNode({ node });

const printGroupChild = ({
  node,
  logicalOperator,
}: {
  node: ConditionalEvaluationNode;
  logicalOperator: ConditionalEvaluationLogicalOperator;
}): string => {
  if (
    node.type === 'GROUP' &&
    node.children.length > 1 &&
    node.logicalOperator !== logicalOperator
  ) {
    return printInParentheses(node);
  }

  return printConditionalEvaluationNode({ node });
};

export const printConditionalEvaluationNode = ({
  node,
}: {
  node: ConditionalEvaluationNode;
}): string => {
  switch (node.type) {
    case 'LITERAL':
      return isString(node.value)
        ? printConditionalEvaluationText({ text: node.value })
        : String(node.value);
    case 'VARIABLE':
      return node.path;
    case 'COMPARISON':
      return [
        printOperand(node.left),
        CONDITIONAL_EVALUATION_SYMBOL_BY_COMPARISON_OPERATOR[node.operator],
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
          printConditionalEvaluationNode({ node: argumentNode }),
        )
        .join(', ')})`;
  }
};
