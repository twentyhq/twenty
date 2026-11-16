import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { type Instruction } from 'expr-eval-fork';

import { type ComputedFieldExpressionNode } from '@/types/ComputedFieldExpressionNode';
import { ComputedFieldExpressionError } from '@/utils/computed-field/ComputedFieldExpressionError';
import { isComputedFieldExpressionBinaryOperator } from '@/utils/computed-field/internal/isComputedFieldExpressionBinaryOperator';
import { isComputedFieldExpressionUnaryOperator } from '@/utils/computed-field/internal/isComputedFieldExpressionUnaryOperator';
import { isComputedFieldExpressionVariableName } from '@/utils/computed-field/internal/isComputedFieldExpressionVariableName';
import { isDefined } from '@/utils/validation/isDefined';

const buildLiteralOrThrow = (literal: unknown): ComputedFieldExpressionNode => {
  if (isString(literal)) {
    return { kind: 'textLiteral', value: literal };
  }

  if (isBoolean(literal)) {
    return { kind: 'booleanLiteral', value: literal };
  }

  if (isNumber(literal) && Number.isFinite(literal)) {
    return { kind: 'numberLiteral', value: literal };
  }

  throw new ComputedFieldExpressionError(
    `Unsupported value "${String(literal)}"`,
  );
};

// A name is a variable only once it is read as a value: followed by a member it is a field path
const toValue = (
  operand: ComputedFieldExpressionNode,
): ComputedFieldExpressionNode => {
  if (operand.kind !== 'fieldPath' || operand.path.length !== 1) {
    return operand;
  }

  const name = operand.path.join('.');

  return isComputedFieldExpressionVariableName(name)
    ? { kind: 'variable', name }
    : operand;
};

// The parser's instructions are in postfix order; a nested expression holds its own instructions as value
export const buildComputedFieldExpressionTreeOrThrow = (
  instructions: Instruction[],
): ComputedFieldExpressionNode => {
  const operands: ComputedFieldExpressionNode[] = [];

  const popOperand = (): ComputedFieldExpressionNode => {
    const operand = operands.pop();

    if (!isDefined(operand)) {
      throw new ComputedFieldExpressionError('The expression is incomplete');
    }

    return operand;
  };

  const popValue = (): ComputedFieldExpressionNode => toValue(popOperand());

  const popValues = (count: number): ComputedFieldExpressionNode[] =>
    Array.from({ length: count }, popValue).reverse();

  for (const { type, value } of instructions) {
    const name = String(value);

    switch (type) {
      case 'INUMBER':
        operands.push(buildLiteralOrThrow(value));
        break;
      case 'IVAR':
        operands.push({ kind: 'fieldPath', path: [name] });
        break;
      case 'IMEMBER': {
        const operand = popOperand();

        if (operand.kind !== 'fieldPath') {
          throw new ComputedFieldExpressionError(
            `".${name}" can only follow a field`,
          );
        }

        operands.push({ kind: 'fieldPath', path: [...operand.path, name] });
        break;
      }
      case 'IEXPR':
        operands.push(
          buildComputedFieldExpressionTreeOrThrow(
            Array.isArray(value) ? value : [],
          ),
        );
        break;
      case 'IARRAY':
        operands.push({ kind: 'list', items: popValues(Number(value)) });
        break;
      case 'IOP1': {
        if (!isComputedFieldExpressionUnaryOperator(name)) {
          throw new ComputedFieldExpressionError(
            `Unsupported operator "${name}"`,
          );
        }

        operands.push({
          kind: 'unaryOperation',
          operator: name,
          operand: popValue(),
        });
        break;
      }
      case 'IOP2': {
        if (!isComputedFieldExpressionBinaryOperator(name)) {
          throw new ComputedFieldExpressionError(
            `Unsupported operator "${name}"`,
          );
        }

        const right = popValue();
        const left = popValue();

        operands.push({ kind: 'binaryOperation', operator: name, left, right });
        break;
      }
      case 'IOP3': {
        if (name !== '?') {
          throw new ComputedFieldExpressionError(
            `Unsupported operator "${name}"`,
          );
        }

        const whenFalse = popValue();
        const whenTrue = popValue();
        const condition = popValue();

        operands.push({ kind: 'conditional', condition, whenTrue, whenFalse });
        break;
      }
      case 'IFUNCALL': {
        const functionArguments = popValues(Number(value));
        const callee = popOperand();

        operands.push({
          kind: 'functionCall',
          name: callee.kind === 'fieldPath' ? callee.path.join('.') : '',
          functionArguments,
        });
        break;
      }
      default:
        throw new ComputedFieldExpressionError(`Unsupported syntax (${type})`);
    }
  }

  const expression = popValue();

  if (operands.length > 0) {
    throw new ComputedFieldExpressionError('The expression is incomplete');
  }

  return expression;
};
