import { parseStoredExpressionTree } from '@/expression/utils/parseStoredExpressionTree';

describe('parseStoredExpressionTree', () => {
  it('should return a stored tree that is an expression', () => {
    const tree = {
      type: 'COMPARISON',
      operator: 'EQUAL',
      left: { type: 'FIELD', fieldUniversalIdentifier: 'stage-id' },
      right: { type: 'LITERAL', value: 'WON' },
    };

    expect(parseStoredExpressionTree({ tree })).toEqual(tree);
  });

  it('should return undefined for a missing or malformed tree', () => {
    expect(parseStoredExpressionTree({ tree: null })).toBeUndefined();
    expect(parseStoredExpressionTree({})).toBeUndefined();
    expect(
      parseStoredExpressionTree({ tree: { type: 'UNKNOWN' } }),
    ).toBeUndefined();
  });
});
