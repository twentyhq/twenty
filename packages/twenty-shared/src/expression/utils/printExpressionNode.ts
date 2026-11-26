import { isNumber, isString } from '@sniptt/guards';

import { EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR } from '@/expression/constants/ExpressionSymbolByArithmeticOperator';
import { EXPRESSION_SYMBOL_BY_COMPARISON_OPERATOR } from '@/expression/constants/ExpressionSymbolByComparisonOperator';
import { EXPRESSION_SYMBOL_BY_UNARY_OPERATOR } from '@/expression/constants/ExpressionSymbolByUnaryOperator';
import { type ExpressionLogicalOperator } from '@/expression/types/ExpressionLogicalOperator';
import { type ExpressionNode } from '@/expression/types/ExpressionNode';

const BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN = /\\\\"$/;
const UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE = '\\u005c"';

// Mirrors the parser; operators of one level read left to right
const OR_PRECEDENCE = 1;
const AND_PRECEDENCE = 2;
const COMPARISON_PRECEDENCE = 3;
const ADDITIVE_PRECEDENCE = 4;
const MULTIPLICATIVE_PRECEDENCE = 5;
const PREFIX_PRECEDENCE = 6;
const ATOM_PRECEDENCE = 7;

const getPrecedence = (node: ExpressionNode): number => {
  switch (node.type) {
    case 'GROUP':
      return node.logicalOperator === 'OR' ? OR_PRECEDENCE : AND_PRECEDENCE;
    case 'COMPARISON':
    case 'IN':
      return COMPARISON_PRECEDENCE;
    case 'CONCATENATION':
      return ADDITIVE_PRECEDENCE;
    case 'ARITHMETIC':
      return node.operator === 'ADD' || node.operator === 'SUBTRACT'
        ? ADDITIVE_PRECEDENCE
        : MULTIPLICATIVE_PRECEDENCE;
    case 'NOT':
    case 'UNARY':
      return PREFIX_PRECEDENCE;
    case 'LITERAL':
      return isNumber(node.value) && node.value < 0
        ? PREFIX_PRECEDENCE
        : ATOM_PRECEDENCE;
    default:
      return ATOM_PRECEDENCE;
  }
};

const printText = (text: string): string =>
  JSON.stringify(text).replace(
    BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN,
    UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE,
  );

export const printExpressionNode = ({
  node,
}: {
  node: ExpressionNode;
}): string => {
  const print = (childNode: ExpressionNode) =>
    printExpressionNode({ node: childNode });

  const printAbove = ({
    childNode,
    precedence,
  }: {
    childNode: ExpressionNode;
    precedence: number;
  }) =>
    getPrecedence(childNode) > precedence
      ? print(childNode)
      : `(${print(childNode)})`;

  const printBinary = ({
    left,
    symbol,
    right,
  }: {
    left: ExpressionNode;
    symbol: string;
    right: ExpressionNode;
  }) => {
    const precedence = getPrecedence(node);

    return [
      printAbove({ childNode: left, precedence: precedence - 1 }),
      symbol,
      printAbove({ childNode: right, precedence }),
    ].join(' ');
  };

  const printGroupChild = ({
    childNode,
    logicalOperator,
  }: {
    childNode: ExpressionNode;
    logicalOperator: ExpressionLogicalOperator;
  }) =>
    childNode.type === 'GROUP' &&
    childNode.children.length > 1 &&
    childNode.logicalOperator !== logicalOperator
      ? `(${print(childNode)})`
      : print(childNode);

  switch (node.type) {
    case 'LITERAL':
      return isString(node.value) ? printText(node.value) : String(node.value);
    case 'VARIABLE':
      return node.path;
    case 'COMPARISON':
      return [
        printAbove({ childNode: node.left, precedence: COMPARISON_PRECEDENCE }),
        EXPRESSION_SYMBOL_BY_COMPARISON_OPERATOR[node.operator],
        printAbove({
          childNode: node.right,
          precedence: COMPARISON_PRECEDENCE,
        }),
      ].join(' ');
    case 'IN':
      return [
        printAbove({
          childNode: node.value,
          precedence: COMPARISON_PRECEDENCE,
        }),
        'in',
        printAbove({ childNode: node.list, precedence: COMPARISON_PRECEDENCE }),
      ].join(' ');
    case 'GROUP':
      return node.children
        .map((childNode) =>
          printGroupChild({ childNode, logicalOperator: node.logicalOperator }),
        )
        .join(node.logicalOperator === 'AND' ? ' and ' : ' or ');
    case 'ARITHMETIC':
      return printBinary({
        left: node.left,
        symbol: EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR[node.operator],
        right: node.right,
      });
    case 'CONCATENATION':
      return printBinary({ left: node.left, symbol: '||', right: node.right });
    case 'NOT':
      return `not ${printAbove({ childNode: node.child, precedence: PREFIX_PRECEDENCE - 1 })}`;
    case 'UNARY':
      return `${EXPRESSION_SYMBOL_BY_UNARY_OPERATOR[node.operator]}${printAbove({ childNode: node.operand, precedence: PREFIX_PRECEDENCE })}`;
    case 'MEMBER':
      return `(${print(node.object)}).${node.property}`;
    case 'LIST':
      return `[${node.items.map(print).join(', ')}]`;
    case 'FUNCTION_CALL':
      return `${node.functionName}(${node.arguments.map(print).join(', ')})`;
  }
};
