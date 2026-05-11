import { createBoundedFailureCache } from '@/lib/visual-runtime/utils/bounded-failure-cache';

describe('createBoundedFailureCache', () => {
  it('records added URLs and reports them via has()', () => {
    const cache = createBoundedFailureCache(8);
    cache.add('https://example.com/a.png');
    expect(cache.has('https://example.com/a.png')).toBe(true);
    expect(cache.has('https://example.com/b.png')).toBe(false);
  });

  it('treats add() as idempotent', () => {
    const cache = createBoundedFailureCache(2);
    cache.add('a');
    cache.add('a');
    cache.add('b');
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(true);
  });

  it('evicts the oldest entry once maxSize is reached (FIFO)', () => {
    const cache = createBoundedFailureCache(3);
    cache.add('a');
    cache.add('b');
    cache.add('c');
    cache.add('d');

    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(true);
  });

  it('does not double-count when a re-added entry is later evicted', () => {
    const cache = createBoundedFailureCache(2);
    cache.add('a');
    cache.add('a');
    cache.add('b');
    cache.add('c');

    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);
  });

  it('throws on a non-positive or non-integer maxSize', () => {
    expect(() => createBoundedFailureCache(0)).toThrow();
    expect(() => createBoundedFailureCache(-1)).toThrow();
    expect(() => createBoundedFailureCache(1.5)).toThrow();
    expect(() => createBoundedFailureCache(Number.NaN)).toThrow();
  });
});
