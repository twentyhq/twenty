import {
  isArray,
  isBoolean,
  isNonEmptyString,
  isNumber,
  isObject,
  isString,
} from '@sniptt/guards';

import { type ConditionalAvailabilityExpressionNode } from '@/types/conditional-display/ConditionalAvailabilityExpressionNode';
import { type ConditionalDisplay } from '@/types/conditional-display/ConditionalDisplay';
import { conditionalAvailabilityParser } from '@/utils/command-menu-items/conditionalAvailabilityParser';
import { compileConditionalAvailabilityExpressionNode } from '@/utils/conditional-display/compileConditionalAvailabilityExpressionNode';
import { buildConditionalAvailabilityCompilationError } from '@/utils/conditional-display/internal/buildConditionalAvailabilityCompilationError';
import { isDefined } from '@/utils/validation/isDefined';

type Token = { type: string; value: unknown };

const isToken = (value: unknown): value is Token =>
  isObject(value) &&
  'type' in value &&
  isString(value.type) &&
  'value' in value;

export const compileConditionalAvailabilityExpression = (
  expression: string,
): ConditionalDisplay | null => {
  const fail = (reason: string): never => {
    throw buildConditionalAvailabilityCompilationError({ expression, reason });
  };

  const toExpressionNode = (
    tokens: unknown,
  ): ConditionalAvailabilityExpressionNode => {
    if (!isArray(tokens) || !tokens.every(isToken)) {
      return fail('unsupported parsed token list');
    }

    const stack: ConditionalAvailabilityExpressionNode[] = [];

    const pop = ({ type }: Token) =>
      stack.pop() ?? fail(`unsupported token ${type} without operand`);

    const popMany = (token: Token) =>
      Array.from({ length: isNumber(token.value) ? token.value : 0 }, () =>
        pop(token),
      ).reverse();

    const toNode = (token: Token): ConditionalAvailabilityExpressionNode => {
      const { type, value } = token;

      switch (type) {
        case 'INUMBER':
          return isString(value) || isNumber(value) || isBoolean(value)
            ? { kind: 'literal', value }
            : fail(`unsupported literal ${JSON.stringify(value)}`);
        case 'IVAR':
          return isNonEmptyString(value)
            ? { kind: 'variable', name: value }
            : fail(`unsupported variable ${JSON.stringify(value)}`);
        case 'IMEMBER': {
          const object = pop(token);

          return isNonEmptyString(value)
            ? { kind: 'member', object, memberName: value }
            : fail(`unsupported member ${JSON.stringify(value)}`);
        }
        case 'IEXPR':
          return toExpressionNode(value);
        case 'IOP1': {
          const operand = pop(token);

          return value === 'not'
            ? { kind: 'not', operand }
            : fail(`unsupported operator "${String(value)}"`);
        }
        case 'IOP2': {
          const right = pop(token);
          const left = pop(token);

          switch (value) {
            case 'and':
            case 'or':
              return { kind: 'logicalOperation', operator: value, left, right };
            case '==':
            case '!=':
            case '<':
            case '<=':
            case '>':
            case '>=':
              return { kind: 'comparison', operator: value, left, right };
            default:
              return fail(`unsupported operator "${String(value)}"`);
          }
        }
        case 'IARRAY':
          return { kind: 'list', elements: popMany(token) };
        case 'IFUNCALL': {
          const functionArguments = popMany(token);
          const callee = pop(token);

          return callee.kind === 'variable'
            ? {
                kind: 'functionCall',
                functionName: callee.name,
                functionArguments,
              }
            : fail('unsupported call of a non-function');
        }
        default:
          return fail(`unsupported token ${type}`);
      }
    };

    tokens.forEach((token) => stack.push(toNode(token)));

    const [expressionNode, ...remainingExpressionNodes] = stack;

    return isDefined(expressionNode) && remainingExpressionNodes.length === 0
      ? expressionNode
      : fail('unsupported statement sequence');
  };

  const parseTokens = (): unknown => {
    try {
      const parsedExpression = conditionalAvailabilityParser.parse(expression);

      return 'tokens' in parsedExpression ? parsedExpression.tokens : undefined;
    } catch (error) {
      return fail(
        `unsupported syntax (${error instanceof Error ? error.message : String(error)})`,
      );
    }
  };

  return compileConditionalAvailabilityExpressionNode({
    expressionNode: toExpressionNode(parseTokens()),
    expression,
    source: expression,
  });
};
