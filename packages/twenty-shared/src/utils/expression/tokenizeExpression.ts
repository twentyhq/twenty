import { type ExpressionToken } from '@/types/ExpressionToken';
import { isDefined } from '@/utils/validation/isDefined';

const PATH_PATTERN = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/;
const NUMBER_PATTERN = /^\d+(?:\.\d+)?/;
const WHITESPACE_PATTERN = /^\s+/;
const QUOTE_CHARACTERS = ['"', "'"];

const readString = (
  expression: string,
  start: number,
): Pick<ExpressionToken, 'type' | 'end'> => {
  const quote = expression[start];

  for (let index = start + 1; index < expression.length; index++) {
    if (expression[index] === '\\') {
      index++;
      continue;
    }

    if (expression[index] === quote) {
      return { type: 'string', end: index + 1 };
    }
  }

  return { type: 'unclosedString', end: expression.length };
};

const readToken = (
  expression: string,
  start: number,
): Pick<ExpressionToken, 'type' | 'end'> => {
  const character = expression[start] ?? '';

  if (QUOTE_CHARACTERS.includes(character)) {
    return readString(expression, start);
  }

  const rest = expression.slice(start);

  const patternMatches: [ExpressionToken['type'], RegExp][] = [
    ['whitespace', WHITESPACE_PATTERN],
    ['number', NUMBER_PATTERN],
    ['path', PATH_PATTERN],
  ];

  for (const [type, pattern] of patternMatches) {
    const match = rest.match(pattern);

    if (isDefined(match)) {
      return { type, end: start + match[0].length };
    }
  }

  return { type: 'symbol', end: start + 1 };
};

export const tokenizeExpression = (expression: string): ExpressionToken[] => {
  const tokens: ExpressionToken[] = [];

  let start = 0;

  while (start < expression.length) {
    const { type, end } = readToken(expression, start);

    tokens.push({ type, text: expression.slice(start, end), start, end });
    start = end;
  }

  return tokens;
};
