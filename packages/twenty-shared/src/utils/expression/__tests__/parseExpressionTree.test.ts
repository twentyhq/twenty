import { parseExpressionTree } from '@/utils/expression/parseExpressionTree';

describe('parseExpressionTree', () => {
  it('should build calls over member paths and nested operators', () => {
    expect(
      parseExpressionTree(
        'sum(deals.amount, deals.isWon and not deals.isArchived)',
      ),
    ).toEqual({
      isValid: true,
      tree: {
        kind: 'call',
        functionName: 'sum',
        arguments: [
          { kind: 'path', path: 'deals.amount' },
          {
            kind: 'binary',
            operator: 'and',
            left: { kind: 'path', path: 'deals.isWon' },
            right: {
              kind: 'unary',
              operator: 'not',
              operand: { kind: 'path', path: 'deals.isArchived' },
            },
          },
        ],
      },
    });
  });

  it('should keep the operand order of a binary operator', () => {
    expect(parseExpressionTree('stage in ["WON", "LOST"]')).toEqual({
      isValid: true,
      tree: {
        kind: 'binary',
        operator: 'in',
        left: { kind: 'path', path: 'stage' },
        right: {
          kind: 'list',
          items: [
            { kind: 'literal', value: 'WON' },
            { kind: 'literal', value: 'LOST' },
          ],
        },
      },
    });
  });

  it('should refuse bracket access', () => {
    expect(parseExpressionTree('emails[0]')).toMatchObject({
      isValid: false,
      errorCode: 'BRACKET_ACCESS',
    });
  });

  it('should refuse several statements', () => {
    expect(parseExpressionTree('amount > 1; amount < 2')).toMatchObject({
      isValid: false,
      errorCode: 'INVALID_SYNTAX',
      errorParams: { token: ';' },
    });
  });

  it('should report a syntax error', () => {
    expect(parseExpressionTree('amount +')).toMatchObject({
      isValid: false,
      errorCode: 'INCOMPLETE_EXPRESSION',
    });
  });
});
