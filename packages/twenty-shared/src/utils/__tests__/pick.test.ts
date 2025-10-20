import { pick } from '../pick';

describe('pick', () => {
  it('returns object with only requested keys', () => {
    const source = { id: '1', name: 'Jane', role: 'admin' };
    expect(pick(source, ['id', 'role'] as const)).toEqual({
      id: '1',
      role: 'admin',
    });
  });

  it('ignores missing keys', () => {
    const source = { id: '1', name: 'Jane' };
    expect(pick(source, ['id', 'missing'])).toEqual({ id: '1' });
  });

  it('handles nullish sources', () => {
    expect(pick(null, ['id'])).toEqual({});
    expect(pick(undefined, ['id'])).toEqual({});
  });
});
