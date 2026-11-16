import { type ComputedFieldExpressionNode } from '@/types/ComputedFieldExpressionNode';
import { assertUnreachable } from '@/utils/assertUnreachable';

export const getComputedFieldExpressionNodeChildren = (
  node: ComputedFieldExpressionNode,
): ComputedFieldExpressionNode[] => {
  switch (node.kind) {
    case 'textLiteral':
    case 'numberLiteral':
    case 'booleanLiteral':
    case 'fieldPath':
    case 'variable':
      return [];
    case 'unaryOperation':
      return [node.operand];
    case 'binaryOperation':
      return [node.left, node.right];
    case 'conditional':
      return [node.condition, node.whenTrue, node.whenFalse];
    case 'functionCall':
      return node.functionArguments;
    case 'list':
      return node.items;
    default:
      return assertUnreachable(node);
  }
};
