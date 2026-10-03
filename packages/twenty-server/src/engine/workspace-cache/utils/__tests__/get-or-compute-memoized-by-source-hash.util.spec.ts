import {
  type SourceHashMemoEntry,
  getOrComputeMemoizedBySourceHash,
} from 'src/engine/workspace-cache/utils/get-or-compute-memoized-by-source-hash.util';

describe('getOrComputeMemoizedBySourceHash', () => {
  it('computes once and reuses the value while the source hash is unchanged', () => {
    const memo = new Map<string, SourceHashMemoEntry<string[]>>();
    const compute = jest.fn(() => ['admin']);

    const firstValue = getOrComputeMemoizedBySourceHash({
      memo,
      memoKey: 'workspace-1',
      sourceHash: 'hash-1',
      maxEntries: 10,
      now: 1_000,
      compute,
    });
    const secondValue = getOrComputeMemoizedBySourceHash({
      memo,
      memoKey: 'workspace-1',
      sourceHash: 'hash-1',
      maxEntries: 10,
      now: 1_000,
      compute,
    });

    expect(compute).toHaveBeenCalledTimes(1);
    expect(secondValue).toBe(firstValue);
  });

  it('refreshes the last read time when the memoized value is reused', () => {
    const memo = new Map<string, SourceHashMemoEntry<string>>();
    const memoize = (now: number) =>
      getOrComputeMemoizedBySourceHash({
        memo,
        memoKey: 'workspace-1',
        sourceHash: 'hash-1',
        maxEntries: 10,
        now,
        compute: () => 'value',
      });

    memoize(1_000);
    memoize(5_000);

    expect(memo.get('workspace-1')?.lastReadAt).toBe(5_000);
  });

  it('recomputes and replaces the entry when the source hash changes', () => {
    const memo = new Map<string, SourceHashMemoEntry<string>>();

    getOrComputeMemoizedBySourceHash({
      memo,
      memoKey: 'workspace-1',
      sourceHash: 'hash-1',
      maxEntries: 10,
      now: 1_000,
      compute: () => 'first',
    });

    const value = getOrComputeMemoizedBySourceHash({
      memo,
      memoKey: 'workspace-1',
      sourceHash: 'hash-2',
      maxEntries: 10,
      now: 1_000,
      compute: () => 'second',
    });

    expect(value).toBe('second');
    expect(memo.size).toBe(1);
    expect(memo.get('workspace-1')).toEqual({
      sourceHash: 'hash-2',
      value: 'second',
      lastReadAt: 1_000,
    });
  });

  it('keeps one entry per memo key', () => {
    const memo = new Map<string, SourceHashMemoEntry<string>>();

    getOrComputeMemoizedBySourceHash({
      memo,
      memoKey: 'workspace-1',
      sourceHash: 'hash-1',
      maxEntries: 10,
      now: 1_000,
      compute: () => 'first-workspace',
    });
    getOrComputeMemoizedBySourceHash({
      memo,
      memoKey: 'workspace-2',
      sourceHash: 'hash-1',
      maxEntries: 10,
      now: 1_000,
      compute: () => 'second-workspace',
    });

    expect(memo.get('workspace-1')?.value).toBe('first-workspace');
    expect(memo.get('workspace-2')?.value).toBe('second-workspace');
  });

  it('evicts the least recently used entry beyond maxEntries', () => {
    const memo = new Map<string, SourceHashMemoEntry<string>>();
    const memoize = (memoKey: string) =>
      getOrComputeMemoizedBySourceHash({
        memo,
        memoKey,
        sourceHash: 'hash',
        maxEntries: 2,
        now: 1_000,
        compute: () => memoKey,
      });

    memoize('workspace-1');
    memoize('workspace-2');
    memoize('workspace-1');
    memoize('workspace-3');

    expect([...memo.keys()]).toEqual(['workspace-1', 'workspace-3']);
  });

  it('does not memoize when the computation throws', () => {
    const memo = new Map<string, SourceHashMemoEntry<string>>();

    expect(() =>
      getOrComputeMemoizedBySourceHash({
        memo,
        memoKey: 'workspace-1',
        sourceHash: 'hash-1',
        maxEntries: 10,
        now: 1_000,
        compute: () => {
          throw new Error('compute failed');
        },
      }),
    ).toThrow('compute failed');
    expect(memo.size).toBe(0);
  });
});
