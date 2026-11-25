import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { type Instruction } from 'expr-eval-fork';

import { type ExpressionNode } from '@/types/ExpressionNode';
import { type ExpressionTreeResult } from '@/types/ExpressionTreeResult';

type ExpressionTreeError = Extract<ExpressionTreeResult, { isValid: false }>;

const BRACKET_ACCESS_OPERATOR = '[';

const UNEXPECTED_TOKEN_BY_INSTRUCTION_TYPE: Partial<Record<string, string>> = {
  IENDSTATEMENT: ';',
  IOP3: '?',
  IFUNDEF: '=',
  IVARNAME: '=',
};

class ExpressionTreeException extends Error {
  constructor(readonly treeError: ExpressionTreeError) {
    super(treeError.errorMessage);
  }
}

const throwTreeError = (
  treeError: Omit<ExpressionTreeError, 'isValid'>,
): never => {
  throw new ExpressionTreeException({ isValid: false, ...treeError });
};

const throwUnexpectedToken = (token: string): never =>
  throwTreeError({
    errorMessage: `Unexpected "${token}"`,
    errorCode: 'INVALID_SYNTAX',
    errorParams: { token },
  });

const throwIncompleteExpression = (): never =>
  throwTreeError({
    errorMessage: 'Expression is incomplete',
    errorCode: 'INCOMPLETE_EXPRESSION',
  });

const buildNode = (instructions: Instruction[]): ExpressionNode => {
  const stack: ExpressionNode[] = [];

  const popNode = (): ExpressionNode =>
    stack.pop() ?? throwIncompleteExpression();

  const popNodes = (count: number): ExpressionNode[] =>
    Array.from({ length: count }, popNode).reverse();

  for (const { type, value } of instructions) {
    switch (type) {
      case 'INUMBER':
        if (!isString(value) && !isNumber(value) && !isBoolean(value)) {
          return throwUnexpectedToken(String(value));
        }
        stack.push({ kind: 'literal', value });
        break;
      case 'IVAR':
        stack.push({ kind: 'path', path: String(value) });
        break;
      case 'IMEMBER': {
        const node = popNode();

        if (node.kind !== 'path') {
          return throwUnexpectedToken(`.${String(value)}`);
        }
        stack.push({ kind: 'path', path: `${node.path}.${String(value)}` });
        break;
      }
      // The lazily evaluated operand of "and" and "or"
      case 'IEXPR':
        if (!Array.isArray(value)) {
          return throwIncompleteExpression();
        }
        stack.push(buildNode(value));
        break;
      case 'IARRAY':
        stack.push({ kind: 'list', items: popNodes(Number(value)) });
        break;
      case 'IOP1':
        stack.push({
          kind: 'unary',
          operator: String(value),
          operand: popNode(),
        });
        break;
      case 'IOP2': {
        if (value === BRACKET_ACCESS_OPERATOR) {
          return throwTreeError({
            errorMessage:
              'Bracket access is not supported, use dot access instead',
            errorCode: 'BRACKET_ACCESS',
          });
        }

        const right = popNode();
        const left = popNode();

        stack.push({ kind: 'binary', operator: String(value), left, right });
        break;
      }
      case 'IFUNCALL': {
        const functionArguments = popNodes(Number(value));
        const callee = popNode();

        if (callee.kind !== 'path') {
          return throwUnexpectedToken('(');
        }
        stack.push({
          kind: 'call',
          functionName: callee.path,
          arguments: functionArguments,
        });
        break;
      }
      default:
        return throwUnexpectedToken(
          UNEXPECTED_TOKEN_BY_INSTRUCTION_TYPE[type] ?? String(value),
        );
    }
  }

  const rootNode = popNode();

  return stack.length === 0 ? rootNode : throwIncompleteExpression();
};

export const buildExpressionTree = (
  instructions: Instruction[],
): ExpressionTreeResult => {
  try {
    return { isValid: true, tree: buildNode(instructions) };
  } catch (error) {
    if (error instanceof ExpressionTreeException) {
      return error.treeError;
    }

    throw error;
  }
};
