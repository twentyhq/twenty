import {
  evictLeastRecentlyUsed,
  readLruEntry,
  writeLruEntry,
} from 'src/utils/lru-map.util';

describe('readLruEntry', () => {
  it('returns undefined for a missing key', () => {
    expect(
      readLruEntry({ map: new Map<string, number>(), key: 'a' }),
    ).toBeUndefined();
  });

  it('moves the read key to the most recently used position', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);

    readLruEntry({ map, key: 'a' });

    expect([...map.keys()]).toEqual(['b', 'c', 'a']);
  });
});

describe('writeLruEntry', () => {
  it('keeps the map within maxEntries', () => {
    const map = new Map<string, number>();

    for (let index = 0; index < 10; index += 1) {
      writeLruEntry({ map, key: `k-${index}`, value: index, maxEntries: 3 });
    }

    expect(map.size).toBe(3);
    expect([...map.keys()]).toEqual(['k-7', 'k-8', 'k-9']);
  });

  it('evicts the least recently used entry, not the oldest inserted', () => {
    const map = new Map<string, number>();

    writeLruEntry({ map, key: 'a', value: 1, maxEntries: 2 });
    writeLruEntry({ map, key: 'b', value: 2, maxEntries: 2 });
    readLruEntry({ map, key: 'a' });
    writeLruEntry({ map, key: 'c', value: 3, maxEntries: 2 });

    expect([...map.keys()]).toEqual(['a', 'c']);
  });

  it('overwrites an existing key without growing the map', () => {
    const map = new Map([['a', 1]]);

    writeLruEntry({ map, key: 'a', value: 2, maxEntries: 5 });

    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(2);
  });
});

describe('evictLeastRecentlyUsed', () => {
  const mapOf = (...keys: string[]) =>
    new Map(keys.map((key, index) => [key, index]));

  it('returns 0 and mutates nothing at or under the cap', () => {
    const map = mapOf('a', 'b', 'c');

    expect(evictLeastRecentlyUsed({ map, maxEntries: 3 })).toBe(0);
    expect([...map.keys()]).toEqual(['a', 'b', 'c']);
  });

  it('evicts from the front in insertion-order mode', () => {
    const map = mapOf('a', 'b', 'c', 'd');

    expect(evictLeastRecentlyUsed({ map, maxEntries: 2 })).toBe(2);
    expect([...map.keys()]).toEqual(['c', 'd']);
  });

  it('spares a key refreshed by readLruEntry', () => {
    const map = mapOf('a', 'b', 'c');

    readLruEntry({ map, key: 'a' });
    evictLeastRecentlyUsed({ map, maxEntries: 2 });

    expect([...map.keys()]).toEqual(['c', 'a']);
  });

  it('evicts the lowest recency regardless of insertion order', () => {
    const map = new Map([
      ['a', { lastReadAt: 30 }],
      ['b', { lastReadAt: 10 }],
      ['c', { lastReadAt: 20 }],
    ]);

    const evicted = evictLeastRecentlyUsed({
      map,
      maxEntries: 2,
      recencyOf: (value) => value.lastReadAt,
    });

    expect(evicted).toBe(1);
    expect([...map.keys()]).toEqual(['a', 'c']);
  });

  it('scopes counting and eviction to matching keys', () => {
    const map = mapOf('x:1', 'x:2', 'x:3', 'y:1', 'y:2');

    const evicted = evictLeastRecentlyUsed({
      map,
      maxEntries: 2,
      matches: (key) => key.startsWith('x:'),
    });

    expect(evicted).toBe(1);
    expect([...map.keys()]).toEqual(['x:2', 'x:3', 'y:1', 'y:2']);
  });

  it('evicts a whole batch of minEvict once over cap', () => {
    const map = mapOf('a', 'b', 'c', 'd', 'e', 'f');

    expect(evictLeastRecentlyUsed({ map, maxEntries: 5, minEvict: 4 })).toBe(4);
    expect([...map.keys()]).toEqual(['e', 'f']);
  });

  it('never deletes more entries than exist, and reports the true count', () => {
    const map = mapOf('a', 'b', 'c');

    expect(evictLeastRecentlyUsed({ map, maxEntries: 1, minEvict: 99 })).toBe(3);
    expect(map.size).toBe(0);
  });

  it('applies minEvict identically in ranked and unranked mode', () => {
    const unranked = mapOf('a', 'b', 'c', 'd', 'e');
    const ranked = new Map(
      ['a', 'b', 'c', 'd', 'e'].map((key, index) => [key, { at: index }]),
    );

    const unrankedEvicted = evictLeastRecentlyUsed({
      map: unranked,
      maxEntries: 4,
      minEvict: 3,
    });
    const rankedEvicted = evictLeastRecentlyUsed({
      map: ranked,
      maxEntries: 4,
      minEvict: 3,
      recencyOf: (value) => value.at,
    });

    expect(unrankedEvicted).toBe(rankedEvicted);
    expect([...unranked.keys()]).toEqual([...ranked.keys()]);
  });

  // CoreEntityCacheService.evictLRUEntriesIfNeeded is not migrated yet; this
  // pins that the primitive already expresses it, so the follow-up is a call
  // swap rather than a redesign.
  it('expresses the core entity cache shape: timestamp recency with a batch floor', () => {
    const map = new Map(
      Array.from({ length: 10 }, (_, index) => [
        `key-${index}`,
        { lastHashCheckedAt: index },
      ]),
    );

    const evicted = evictLeastRecentlyUsed({
      map,
      maxEntries: 8,
      minEvict: 4,
      recencyOf: (value) => value.lastHashCheckedAt,
    });

    expect(evicted).toBe(4);
    expect([...map.keys()]).toEqual([
      'key-4',
      'key-5',
      'key-6',
      'key-7',
      'key-8',
      'key-9',
    ]);
  });
});
