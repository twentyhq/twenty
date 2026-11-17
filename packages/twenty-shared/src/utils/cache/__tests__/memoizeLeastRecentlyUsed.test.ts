import { memoizeLeastRecentlyUsed } from '@/utils/cache/memoizeLeastRecentlyUsed';

describe('memoizeLeastRecentlyUsed', () => {
  it('caches falsy values', () => {
    const compute = jest.fn(() => false);
    const memoized = memoizeLeastRecentlyUsed({ compute, maxEntries: 2 });

    expect(memoized('a')).toBe(false);
    expect(memoized('a')).toBe(false);
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('refreshes a cached entry before evicting the least recently used one', () => {
    const compute = jest.fn((key: string) => ({ key }));
    const memoized = memoizeLeastRecentlyUsed({ compute, maxEntries: 2 });
    const first = memoized('a');
    const second = memoized('b');

    expect(memoized('a')).toBe(first);
    memoized('c');
    expect(memoized('a')).toBe(first);
    expect(memoized('b')).not.toBe(second);
    expect(compute.mock.calls.map(([key]) => key)).toEqual([
      'a',
      'b',
      'c',
      'b',
    ]);
  });

  it('does not cache a failed computation', () => {
    const compute = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('invalid expression');
      })
      .mockReturnValue('valid');
    const memoized = memoizeLeastRecentlyUsed({ compute, maxEntries: 2 });

    expect(() => memoized('a')).toThrow('invalid expression');
    expect(memoized('a')).toBe('valid');
    expect(compute).toHaveBeenCalledTimes(2);
  });
});
