import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { type Instruction } from 'expr-eval-fork';

import { EXPRESSION_PREFIX_FUNCTION_NAMES } from '@/expression/constants/ExpressionPrefixFunctionNames';
import { EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR } from '@/expression/constants/ExpressionSymbolByArithmeticOperator';
import { EXPRESSION_SYMBOL_BY_COMPARISON_OPERATOR } from '@/expression/constants/ExpressionSymbolByComparisonOperator';
import { EXPRESSION_SYMBOL_BY_UNARY_OPERATOR } from '@/expression/constants/ExpressionSymbolByUnaryOperator';
import { type ExpressionLogicalOperator } from '@/expression/types/ExpressionLogicalOperator';
import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { typedObjectEntries } from '@/utils/typed-object-entries';
import { isDefined } from '@/utils/validation/isDefined';

const invertSymbols = <TOperator extends string>(
  symbolByOperator: Record<TOperator, string>,
): Map<string, TOperator> =>
  new Map(
    typedObjectEntries(symbolByOperator).map(([operator, symbol]) => [
      symbol,
      operator,
    ]),
  );

const COMPARISON_OPERATOR_BY_SYMBOL = invertSymbols(
  EXPRESSION_SYMBOL_BY_COMPARISON_OPERATOR,
);
const ARITHMETIC_OPERATOR_BY_SYMBOL = invertSymbols(
  EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR,
);
const UNARY_OPERATOR_BY_SYMBOL = invertSymbols(
  EXPRESSION_SYMBOL_BY_UNARY_OPERATOR,
);
const LOGICAL_OPERATOR_BY_SYMBOL = new Map<string, ExpressionLogicalOperator>([
  ['and', 'AND'],
  ['or', 'OR'],
]);

const toGroupChildren = ({
  operand,
  logicalOperator,
}: {
  operand: ExpressionNode;
  logicalOperator: ExpressionLogicalOperator;
}): ExpressionNode[] =>
  operand.type === 'GROUP' && operand.logicalOperator === logicalOperator
    ? operand.children
    : [operand];

const toBinaryNode = ({
  symbol,
  left,
  right,
}: {
  symbol: string;
  left: ExpressionNode;
  right: ExpressionNode;
}): ExpressionNode | null => {
  const comparisonOperator = COMPARISON_OPERATOR_BY_SYMBOL.get(symbol);

  if (isDefined(comparisonOperator)) {
    return { type: 'COMPARISON', operator: comparisonOperator, left, right };
  }

  const logicalOperator = LOGICAL_OPERATOR_BY_SYMBOL.get(symbol);

  if (isDefined(logicalOperator)) {
    return {
      type: 'GROUP',
      logicalOperator,
      children: [
        ...toGroupChildren({ operand: left, logicalOperator }),
        ...toGroupChildren({ operand: right, logicalOperator }),
      ],
    };
  }

  const arithmeticOperator = ARITHMETIC_OPERATOR_BY_SYMBOL.get(symbol);

  if (isDefined(arithmeticOperator)) {
    return { type: 'ARITHMETIC', operator: arithmeticOperator, left, right };
  }

  if (symbol === '||') {
    return { type: 'CONCATENATION', left, right };
  }

  return symbol === 'in' ? { type: 'IN', value: left, list: right } : null;
};

const toUnaryNode = ({
  symbol,
  operand,
}: {
  symbol: string;
  operand: ExpressionNode;
}): ExpressionNode | null => {
  if (symbol === 'not') {
    return { type: 'NOT', child: operand };
  }

  if (symbol === '-' && operand.type === 'LITERAL' && isNumber(operand.value)) {
    return { type: 'LITERAL', value: -operand.value };
  }

  if (
    EXPRESSION_PREFIX_FUNCTION_NAMES.some(
      (prefixFunctionName) => prefixFunctionName === symbol,
    )
  ) {
    return {
      type: 'FUNCTION_CALL',
      functionName: symbol,
      arguments: [operand],
    };
  }

  const unaryOperator = UNARY_OPERATOR_BY_SYMBOL.get(symbol);

  return isDefined(unaryOperator)
    ? { type: 'UNARY', operator: unaryOperator, operand }
    : null;
};

const popAndBuildNode = ({
  instruction,
  stack,
}: {
  instruction: Instruction;
  stack: ExpressionNode[];
}): ExpressionNode | null => {
  const { type, value } = instruction;

  switch (type) {
    case 'INUMBER':
      return isString(value) || isNumber(value) || isBoolean(value)
        ? { type: 'LITERAL', value }
        : null;
    case 'IVAR':
      return isString(value) ? { type: 'VARIABLE', path: value } : null;
    case 'IMEMBER': {
      const object = stack.pop();

      if (!isDefined(object) || !isString(value)) {
        return null;
      }

      return object.type === 'VARIABLE'
        ? { type: 'VARIABLE', path: `${object.path}.${value}` }
        : { type: 'MEMBER', object, property: value };
    }
    case 'IOP1': {
      const operand = stack.pop();

      return isDefined(operand) && isString(value)
        ? toUnaryNode({ symbol: value, operand })
        : null;
    }
    case 'IOP2': {
      const right = stack.pop();
      const left = stack.pop();

      return isDefined(left) && isDefined(right) && isString(value)
        ? toBinaryNode({ symbol: value, left, right })
        : null;
    }
    case 'IARRAY':
      return isNumber(value) && stack.length >= value
        ? { type: 'LIST', items: stack.splice(stack.length - value, value) }
        : null;
    case 'IFUNCALL': {
      if (!isNumber(value) || stack.length <= value) {
        return null;
      }

      const argumentNodes = stack.splice(stack.length - value, value);
      const callee = stack.pop();

      if (callee?.type !== 'VARIABLE' || callee.path.includes('.')) {
        return null;
      }

      return {
        type: 'FUNCTION_CALL',
        functionName: callee.path,
        arguments: argumentNodes,
      };
    }
    default:
      return null;
  }
};

const toUnexpectedToken = ({ type, value }: Instruction): string => {
  switch (type) {
    case 'IMEMBER':
      return `.${String(value)}`;
    case 'IFUNCALL':
      return '(';
    case 'IENDSTATEMENT':
      return ';';
    default:
      return String(value);
  }
};

// The operands of "and" and "or" come nested, as the parser evaluates them lazily
const flattenNestedInstructions = (
  instructions: Instruction[],
): Instruction[] =>
  instructions.flatMap((instruction) =>
    instruction.type === 'IEXPR' && Array.isArray(instruction.value)
      ? flattenNestedInstructions(instruction.value)
      : [instruction],
  );

export const buildExpressionNode = ({
  instructions,
}: {
  instructions: Instruction[];
}): { node: ExpressionNode } | { unexpectedToken: string } => {
  const stack: ExpressionNode[] = [];

  for (const instruction of flattenNestedInstructions(instructions)) {
    const node = popAndBuildNode({ instruction, stack });

    if (!isDefined(node)) {
      return { unexpectedToken: toUnexpectedToken(instruction) };
    }

    stack.push(node);
  }

  const [rootNode] = stack;

  return stack.length === 1 && isDefined(rootNode)
    ? { node: rootNode }
    : { unexpectedToken: '' };
};
