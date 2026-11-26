import { isNumber, isString } from '@sniptt/guards';

import { CONDITIONAL_EVALUATION_SYMBOL_BY_COMPARISON_OPERATOR } from '@/conditional-evaluation/common/constants/ConditionalEvaluationSymbolByComparisonOperator';
import { type ConditionalEvaluationLogicalOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationLogicalOperator';
import { EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR } from '@/constants/ExpressionSymbolByArithmeticOperator';
import { EXPRESSION_SYMBOL_BY_UNARY_OPERATOR } from '@/constants/ExpressionSymbolByUnaryOperator';
import { type ExpressionNode } from '@/types/ExpressionNode';
import { CustomError } from '@/utils/errors/CustomError';
import { isDefined } from '@/utils/validation/isDefined';

const BACKSLASH_BEFORE_CLOSING_QUOTE_PATTERN = /\\\\"$/;
const UNICODE_ESCAPED_BACKSLASH_AND_CLOSING_QUOTE = '\\u005c"';

const COMPARISON_PRECEDENCE = 3;
const PREFIX_PRECEDENCE = 6;
const ATOM_PRECEDENCE = 7;

// Mirrors the parser, from "or" to the prefix operators; operators of one level read left to right
const getPrecedence = (node: ExpressionNode): number => {
  switch (node.type) {
    case 'GROUP':
      return node.logicalOperator === 'OR' ? 1 : 2;
    case 'COMPARISON':
    case 'IN':
      return COMPARISON_PRECEDENCE;
    case 'ARITHMETIC':
      return node.operator === 'MULTIPLY' ||
        node.operator === 'DIVIDE' ||
        node.operator === 'REMAINDER'
        ? 5
        : 4;
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

type FieldNode = Extract<ExpressionNode, { type: 'FIELD' }>;

export const printExpressionNode = ({
  node,
  printField,
}: {
  node: ExpressionNode;
  // Names a field reference, as only the caller knows the current field names
  printField?: (fieldNode: FieldNode) => string;
}): string => {
  const print = (childNode: ExpressionNode) =>
    printExpressionNode({ node: childNode, printField });

  const printAbove = (childNode: ExpressionNode, precedence: number) =>
    getPrecedence(childNode) > precedence
      ? print(childNode)
      : `(${print(childNode)})`;

  const printGroupChild = ({
    childNode,
    logicalOperator,
  }: {
    childNode: ExpressionNode;
    logicalOperator: ConditionalEvaluationLogicalOperator;
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
    case 'FIELD':
      if (!isDefined(printField)) {
        throw new CustomError(
          'A field reference needs printField to be printed',
          'MISSING_FIELD_PRINTER',
        );
      }

      return printField(node);
    case 'COMPARISON':
      return [
        printAbove(node.left, COMPARISON_PRECEDENCE),
        CONDITIONAL_EVALUATION_SYMBOL_BY_COMPARISON_OPERATOR[node.operator],
        printAbove(node.right, COMPARISON_PRECEDENCE),
      ].join(' ');
    case 'IN':
      return `${printAbove(node.value, COMPARISON_PRECEDENCE)} in ${printAbove(node.list, COMPARISON_PRECEDENCE)}`;
    case 'GROUP':
      return node.children
        .map((childNode) =>
          printGroupChild({ childNode, logicalOperator: node.logicalOperator }),
        )
        .join(node.logicalOperator === 'AND' ? ' and ' : ' or ');
    case 'ARITHMETIC': {
      const precedence = getPrecedence(node);

      return [
        printAbove(node.left, precedence - 1),
        EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR[node.operator],
        printAbove(node.right, precedence),
      ].join(' ');
    }
    case 'NOT':
      return `not ${printAbove(node.child, PREFIX_PRECEDENCE - 1)}`;
    case 'UNARY': {
      const symbol = EXPRESSION_SYMBOL_BY_UNARY_OPERATOR[node.operator];
      const operand = printAbove(node.operand, PREFIX_PRECEDENCE);

      return node.operator === 'NEGATE' || node.operator === 'PLUS'
        ? `${symbol}${operand}`
        : `${symbol} ${operand}`;
    }
    case 'LIST':
      return `[${node.items.map(print).join(', ')}]`;
    case 'FUNCTION_CALL':
      return `${node.functionName}(${node.arguments.map(print).join(', ')})`;
  }
};
