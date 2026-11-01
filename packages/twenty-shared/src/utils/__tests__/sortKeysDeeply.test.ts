import { sortKeysDeeply } from '@/utils';

describe('sortKeysDeeply', () => {
  it('gives objects with the same entries the same key order at every depth', () => {
    const live = {
      success: true,
      result: { records: [{ name: 'A', id: '1' }] },
    };
    const reloaded = {
      result: { records: [{ id: '1', name: 'A' }] },
      success: true,
    };

    expect(JSON.stringify(sortKeysDeeply(reloaded))).toBe(
      JSON.stringify(sortKeysDeeply(live)),
    );
  });

  it('keeps values, array order and class instances', () => {
    const data = new Uint8Array([1, 2, 3]);
    const value = { ids: ['2', '1'], file: { data } };

    const sorted = sortKeysDeeply(value);

    expect(sorted).toEqual(value);
    expect(sorted.file.data).toBe(data);
  });
});
