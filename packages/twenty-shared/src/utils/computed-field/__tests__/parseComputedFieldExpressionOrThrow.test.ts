import { parseComputedFieldExpressionOrThrow } from '@/utils/computed-field/parseComputedFieldExpressionOrThrow';

describe('parseComputedFieldExpressionOrThrow', () => {
  it('reads an expression as a tree', () => {
    expect(
      parseComputedFieldExpressionOrThrow(
        "round(company.revenue / 3, 2) > 10 ? 'big' : status",
      ),
    ).toEqual({
      kind: 'conditional',
      condition: {
        kind: 'binaryOperation',
        operator: '>',
        left: {
          kind: 'functionCall',
          name: 'round',
          functionArguments: [
            {
              kind: 'binaryOperation',
              operator: '/',
              left: { kind: 'fieldPath', path: ['company', 'revenue'] },
              right: { kind: 'numberLiteral', value: 3 },
            },
            { kind: 'numberLiteral', value: 2 },
          ],
        },
        right: { kind: 'numberLiteral', value: 10 },
      },
      whenTrue: { kind: 'textLiteral', value: 'big' },
      whenFalse: { kind: 'fieldPath', path: ['status'] },
    });
  });

  it('reads "now" and "today" as variables, and as fields once followed by a member', () => {
    expect(parseComputedFieldExpressionOrThrow('today')).toEqual({
      kind: 'variable',
      name: 'today',
    });
    expect(parseComputedFieldExpressionOrThrow('now.label')).toEqual({
      kind: 'fieldPath',
      path: ['now', 'label'],
    });
  });

  it.each(['constructor', 'toString', 'valueOf', 'hasOwnProperty'])(
    'reads %s as a field wherever it stands',
    (fieldName) => {
      expect(parseComputedFieldExpressionOrThrow(`${fieldName} + 1`)).toEqual({
        kind: 'binaryOperation',
        operator: '+',
        left: { kind: 'fieldPath', path: [fieldName] },
        right: { kind: 'numberLiteral', value: 1 },
      });
      expect(parseComputedFieldExpressionOrThrow(`abs(${fieldName})`)).toEqual({
        kind: 'functionCall',
        name: 'abs',
        functionArguments: [{ kind: 'fieldPath', path: [fieldName] }],
      });
    },
  );

  it.each([
    ['', 'empty'],
    ['amount +', 'unexpected'],
    ['amount ^ 2', ''],
    ['amount; 1', 'Unsupported syntax'],
    ['(amount + 1).label', 'can only follow a field'],
    ['a'.repeat(2001), 'longer than 2000 characters'],
  ])('rejects %s', (expression, expectedMessage) => {
    expect(() => parseComputedFieldExpressionOrThrow(expression)).toThrow(
      expectedMessage,
    );
  });
});
