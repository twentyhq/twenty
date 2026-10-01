import { tokenizeValidationRuleExpression } from '@/utils/validation-rule/tokenizeValidationRuleExpression';

const describeTokens = (expression: string) =>
  tokenizeValidationRuleExpression(expression).map(
    ({ type, text }) => `${type}:${text}`,
  );

describe('tokenizeValidationRuleExpression', () => {
  it('should keep a dotted path in one token', () => {
    expect(describeTokens('company.employees >= 10.5')).toEqual([
      'path:company.employees',
      'whitespace: ',
      'symbol:>',
      'symbol:=',
      'whitespace: ',
      'number:10.5',
    ]);
  });

  it('should read strings with escaped quotes and flag an unclosed one', () => {
    expect(describeTokens('"a\\"b" or \'open')).toEqual([
      'string:"a\\"b"',
      'whitespace: ',
      'path:or',
      'whitespace: ',
      "unclosedString:'open",
    ]);
  });

  it('should stop a path at a trailing dot', () => {
    expect(describeTokens('company.')).toEqual(['path:company', 'symbol:.']);
  });

  it('should cover the whole expression with contiguous offsets', () => {
    const expression = 'isDefined(amount) and stage in ["NEW"]';
    const tokens = tokenizeValidationRuleExpression(expression);

    expect(tokens.map(({ text }) => text).join('')).toBe(expression);
    expect(
      tokens.every(({ start, end, text }) => end - start === text.length),
    ).toBe(true);
  });
});
