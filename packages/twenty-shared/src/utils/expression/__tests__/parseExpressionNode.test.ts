import { parseExpressionNode } from '@/utils/expression/parseExpressionNode';

describe('parseExpressionNode', () => {
  it('should build a call over member paths with a nested condition', () => {
    expect(
      parseExpressionNode(
        'sum(deals.amount, deals.isWon and not deals.isArchived)',
      ),
    ).toEqual({
      isValid: true,
      node: {
        type: 'FUNCTION_CALL',
        functionName: 'sum',
        arguments: [
          { type: 'VARIABLE', path: 'deals.amount' },
          {
            type: 'GROUP',
            logicalOperator: 'AND',
            children: [
              { type: 'VARIABLE', path: 'deals.isWon' },
              {
                type: 'NOT',
                child: { type: 'VARIABLE', path: 'deals.isArchived' },
              },
            ],
          },
        ],
      },
    });
  });

  it('should keep the operand order of arithmetic and membership', () => {
    expect(parseExpressionNode('price - discount in [1, 2]')).toEqual({
      isValid: true,
      node: {
        type: 'IN',
        value: {
          type: 'ARITHMETIC',
          operator: 'SUBTRACT',
          left: { type: 'VARIABLE', path: 'price' },
          right: { type: 'VARIABLE', path: 'discount' },
        },
        list: {
          type: 'LIST',
          items: [
            { type: 'LITERAL', value: 1 },
            { type: 'LITERAL', value: 2 },
          ],
        },
      },
    });
  });

  it('should refuse bracket access', () => {
    expect(parseExpressionNode('emails[0]')).toMatchObject({
      isValid: false,
      errorCode: 'BRACKET_ACCESS',
    });
  });

  it('should refuse several statements', () => {
    expect(parseExpressionNode('amount > 1; amount < 2')).toMatchObject({
      isValid: false,
      errorCode: 'INVALID_SYNTAX',
      errorParams: { token: ';' },
    });
  });

  it('should report a syntax error', () => {
    expect(parseExpressionNode('amount +')).toMatchObject({
      isValid: false,
      errorCode: 'INCOMPLETE_EXPRESSION',
    });
  });
});
