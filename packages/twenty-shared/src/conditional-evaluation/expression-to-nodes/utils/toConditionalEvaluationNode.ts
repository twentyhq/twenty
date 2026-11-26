// TODO(@neo773): remove once no rule is written as text anymore (stored widget rules are converted in 2.61; built-in rules and app manifests still send text)
import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { type Instruction } from 'expr-eval-fork';

import { CONDITIONAL_EVALUATION_SYMBOL_BY_COMPARISON_OPERATOR } from '@/conditional-evaluation/common/constants/ConditionalEvaluationSymbolByComparisonOperator';
import { type ConditionalEvaluationComparisonOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationComparisonOperator';
import { type ConditionalEvaluationLogicalOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationLogicalOperator';
import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { typedObjectEntries } from '@/utils/typed-object-entries';
import { isDefined } from '@/utils/validation/isDefined';

const COMPARISON_OPERATOR_BY_SYMBOL = new Map<
  string,
  ConditionalEvaluationComparisonOperator
>(
  typedObjectEntries(CONDITIONAL_EVALUATION_SYMBOL_BY_COMPARISON_OPERATOR).map(
    ([comparisonOperator, symbol]) => [symbol, comparisonOperator],
  ),
);

const toLogicalOperator = (
  symbol: string,
): ConditionalEvaluationLogicalOperator | null => {
  switch (symbol) {
    case 'and':
      return 'AND';
    case 'or':
      return 'OR';
    default:
      return null;
  }
};

const toGroupChildren = ({
  operand,
  logicalOperator,
}: {
  operand: ConditionalEvaluationNode;
  logicalOperator: ConditionalEvaluationLogicalOperator;
}): ConditionalEvaluationNode[] =>
  operand.type === 'GROUP' && operand.logicalOperator === logicalOperator
    ? operand.children
    : [operand];

const toBinaryNode = ({
  symbol,
  left,
  right,
}: {
  symbol: string;
  left: ConditionalEvaluationNode;
  right: ConditionalEvaluationNode;
}): ConditionalEvaluationNode | null => {
  const comparisonOperator = COMPARISON_OPERATOR_BY_SYMBOL.get(symbol);

  if (isDefined(comparisonOperator)) {
    return { type: 'COMPARISON', operator: comparisonOperator, left, right };
  }

  const logicalOperator = toLogicalOperator(symbol);

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

  return null;
};

const toUnaryNode = ({
  symbol,
  operand,
}: {
  symbol: string;
  operand: ConditionalEvaluationNode;
}): ConditionalEvaluationNode | null => {
  if (symbol === 'not') {
    return { type: 'NOT', child: operand };
  }

  if (symbol === '-' && operand.type === 'LITERAL' && isNumber(operand.value)) {
    return { type: 'LITERAL', value: -operand.value };
  }

  return null;
};

const popAndBuildNode = ({
  instruction,
  stack,
}: {
  instruction: Instruction;
  stack: ConditionalEvaluationNode[];
}): ConditionalEvaluationNode | null => {
  const { type, value } = instruction;

  switch (type) {
    case 'INUMBER':
      return isString(value) || isNumber(value) || isBoolean(value)
        ? { type: 'LITERAL', value }
        : null;
    case 'IVAR':
      return isString(value) ? { type: 'VARIABLE', path: value } : null;
    case 'IMEMBER': {
      const variable = stack.pop();

      return variable?.type === 'VARIABLE' && isString(value)
        ? { type: 'VARIABLE', path: `${variable.path}.${value}` }
        : null;
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

const flattenNestedInstructions = (
  instructions: Instruction[],
): Instruction[] =>
  instructions.flatMap((instruction) =>
    instruction.type === 'IEXPR' && Array.isArray(instruction.value)
      ? flattenNestedInstructions(instruction.value)
      : [instruction],
  );

export const toConditionalEvaluationNode = ({
  instructions,
}: {
  instructions: Instruction[];
}): { node: ConditionalEvaluationNode } | { unexpectedToken: string } => {
  const stack: ConditionalEvaluationNode[] = [];

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
