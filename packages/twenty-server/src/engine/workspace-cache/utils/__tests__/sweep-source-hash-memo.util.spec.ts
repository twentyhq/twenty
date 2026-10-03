import { type SourceHashMemoEntry } from 'src/engine/workspace-cache/utils/get-or-compute-memoized-by-source-hash.util';
import { sweepSourceHashMemo } from 'src/engine/workspace-cache/utils/sweep-source-hash-memo.util';

const TTL_MS = 1_000;

describe('sweepSourceHashMemo', () => {
  it('evicts entries idle longer than the ttl and keeps recently read ones', () => {
    const memo = new Map<string, SourceHashMemoEntry<string>>([
      ['idle-workspace', { sourceHash: 'hash', value: 'idle', lastReadAt: 0 }],
      [
        'active-workspace',
        { sourceHash: 'hash', value: 'active', lastReadAt: 9_500 },
      ],
    ]);

    const evicted = sweepSourceHashMemo({ memo, now: 10_000, ttlMs: TTL_MS });

    expect(evicted).toBe(1);
    expect([...memo.keys()]).toEqual(['active-workspace']);
  });

  it('keeps an entry read exactly at the ttl boundary', () => {
    const memo = new Map<string, SourceHashMemoEntry<string>>([
      ['workspace', { sourceHash: 'hash', value: 'value', lastReadAt: 9_000 }],
    ]);

    expect(sweepSourceHashMemo({ memo, now: 10_000, ttlMs: TTL_MS })).toBe(0);
    expect(memo.size).toBe(1);
  });

  it('returns zero on an empty memo', () => {
    expect(
      sweepSourceHashMemo({
        memo: new Map<string, SourceHashMemoEntry<string>>(),
        now: 10_000,
        ttlMs: TTL_MS,
      }),
    ).toBe(0);
  });
});
