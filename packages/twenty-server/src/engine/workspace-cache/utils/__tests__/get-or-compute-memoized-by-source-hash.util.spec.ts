import {
  type SourceHashMemoEntry,
  getOrComputeMemoizedBySourceHash,
} from 'src/engine/workspace-cache/utils/get-or-compute-memoized-by-source-hash.util';

describe('getOrComputeMemoizedBySourceHash', () => {
  it('computes once and reuses the value while the source hash is unchanged', () => {
    const memo = new Map<string, SourceHashMemoEntry<string[]>>();
    const compute = jest.fn(() => ['admin']);
    const memoize = () =>
      getOrComputeMemoizedBySourceHash({
        memo,
        memoKey: 'workspace-1',
        sourceHash: 'hash-1',
        maxEntries: 10,
        now: 1_000,
        compute,
      });

    const firstValue = memoize();
    const secondValue = memoize();

    expect(compute).toHaveBeenCalledTimes(1);
    expect(secondValue).toBe(firstValue);
  });

  it('recomputes when the source hash changes', () => {
    const memo = new Map<string, SourceHashMemoEntry<string>>();
    const memoize = (sourceHash: string, value: string) =>
      getOrComputeMemoizedBySourceHash({
        memo,
        memoKey: 'workspace-1',
        sourceHash,
        maxEntries: 10,
        now: 1_000,
        compute: () => value,
      });

    memoize('hash-1', 'first');

    expect(memoize('hash-2', 'second')).toBe('second');
    expect(memo.size).toBe(1);
    expect(memo.get('workspace-1')).toMatchObject({
      sourceHash: 'hash-2',
      value: 'second',
    });
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
});
