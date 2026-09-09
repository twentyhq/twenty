import { readLruEntry, writeLruEntry } from 'src/utils/lru-map.util';

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
