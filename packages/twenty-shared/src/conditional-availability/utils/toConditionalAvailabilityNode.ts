import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { type Instruction } from 'expr-eval-fork';

import { CONDITIONAL_AVAILABILITY_COMPARISON_OPERATOR_SYMBOLS } from '@/conditional-availability/constants/ConditionalAvailabilityComparisonOperatorSymbols';
import { type ConditionalAvailabilityComparisonOperator } from '@/conditional-availability/types/ConditionalAvailabilityComparisonOperator';
import { type ConditionalAvailabilityLogicalOperator } from '@/conditional-availability/types/ConditionalAvailabilityLogicalOperator';
import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';
import { typedObjectEntries } from '@/utils/typed-object-entries';
import { isDefined } from '@/utils/validation/isDefined';

type NodeStackState =
  | { nodes: ConditionalAvailabilityNode[] }
  | { unexpectedToken: string };

const toComparisonOperator = (
  symbol: string,
): ConditionalAvailabilityComparisonOperator | null =>
  typedObjectEntries(CONDITIONAL_AVAILABILITY_COMPARISON_OPERATOR_SYMBOLS).find(
    ([, operatorSymbol]) => operatorSymbol === symbol,
  )?.[0] ?? null;

const toLogicalOperator = (
  symbol: string,
): ConditionalAvailabilityLogicalOperator | null => {
  switch (symbol) {
    case 'and':
      return 'AND';
    case 'or':
      return 'OR';
    default:
      return null;
  }
};

const replaceTopNodes = ({
  nodes,
  count,
  node,
}: {
  nodes: ConditionalAvailabilityNode[];
  count: number;
  node: ConditionalAvailabilityNode;
}): NodeStackState => ({
  nodes: [...nodes.slice(0, nodes.length - count), node],
});

const toGroupChildren = ({
  operand,
  logicalOperator,
}: {
  operand: ConditionalAvailabilityNode;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): ConditionalAvailabilityNode[] =>
  operand.type === 'GROUP' && operand.logicalOperator === logicalOperator
    ? operand.children
    : [operand];

const toBinaryNode = ({
  symbol,
  left,
  right,
}: {
  symbol: string;
  left: ConditionalAvailabilityNode;
  right: ConditionalAvailabilityNode;
}): ConditionalAvailabilityNode | null => {
  const comparisonOperator = toComparisonOperator(symbol);

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
  operand: ConditionalAvailabilityNode;
}): ConditionalAvailabilityNode | null => {
  if (symbol === 'not') {
    return { type: 'NOT', child: operand };
  }

  if (symbol === '-' && operand.type === 'LITERAL' && isNumber(operand.value)) {
    return { type: 'LITERAL', value: -operand.value };
  }

  return null;
};

const pushInstruction = (
  state: NodeStackState,
  instruction: Instruction,
): NodeStackState => {
  if ('unexpectedToken' in state) {
    return state;
  }

  const { nodes } = state;
  const topNode = nodes[nodes.length - 1];
  const secondTopNode = nodes[nodes.length - 2];
  const unexpectedInstruction = {
    unexpectedToken: String(instruction.value),
  };

  switch (instruction.type) {
    case 'INUMBER':
      return isString(instruction.value) ||
        isNumber(instruction.value) ||
        isBoolean(instruction.value)
        ? { nodes: [...nodes, { type: 'LITERAL', value: instruction.value }] }
        : unexpectedInstruction;
    case 'IVAR':
      return isString(instruction.value)
        ? { nodes: [...nodes, { type: 'PATH', path: instruction.value }] }
        : unexpectedInstruction;
    case 'IMEMBER':
      return topNode?.type === 'PATH' && isString(instruction.value)
        ? replaceTopNodes({
            nodes,
            count: 1,
            node: {
              type: 'PATH',
              path: `${topNode.path}.${instruction.value}`,
            },
          })
        : { unexpectedToken: `.${String(instruction.value)}` };
    case 'IOP1': {
      const unaryNode =
        isDefined(topNode) && isString(instruction.value)
          ? toUnaryNode({ symbol: instruction.value, operand: topNode })
          : null;

      return isDefined(unaryNode)
        ? replaceTopNodes({ nodes, count: 1, node: unaryNode })
        : unexpectedInstruction;
    }
    case 'IOP2': {
      const binaryNode =
        isDefined(secondTopNode) &&
        isDefined(topNode) &&
        isString(instruction.value)
          ? toBinaryNode({
              symbol: instruction.value,
              left: secondTopNode,
              right: topNode,
            })
          : null;

      return isDefined(binaryNode)
        ? replaceTopNodes({ nodes, count: 2, node: binaryNode })
        : unexpectedInstruction;
    }
    case 'IEXPR': {
      if (!Array.isArray(instruction.value)) {
        return unexpectedInstruction;
      }

      const nestedResult = toConditionalAvailabilityNode({
        instructions: instruction.value,
      });

      return 'node' in nestedResult
        ? { nodes: [...nodes, nestedResult.node] }
        : nestedResult;
    }
    case 'IFUNCALL': {
      const argumentCount = instruction.value;

      if (!isNumber(argumentCount)) {
        return unexpectedInstruction;
      }

      const callee = nodes[nodes.length - argumentCount - 1];

      if (callee?.type !== 'PATH' || callee.path.includes('.')) {
        return { unexpectedToken: '(' };
      }

      return replaceTopNodes({
        nodes,
        count: argumentCount + 1,
        node: {
          type: 'CALL',
          functionName: callee.path,
          arguments: nodes.slice(nodes.length - argumentCount),
        },
      });
    }
    case 'IENDSTATEMENT':
      return { unexpectedToken: ';' };
    default:
      return unexpectedInstruction;
  }
};

export const toConditionalAvailabilityNode = ({
  instructions,
}: {
  instructions: Instruction[];
}): { node: ConditionalAvailabilityNode } | { unexpectedToken: string } => {
  const state = instructions.reduce<NodeStackState>(pushInstruction, {
    nodes: [],
  });

  if ('unexpectedToken' in state) {
    return state;
  }

  const [rootNode] = state.nodes;

  return state.nodes.length === 1 && isDefined(rootNode)
    ? { node: rootNode }
    : { unexpectedToken: '' };
};
