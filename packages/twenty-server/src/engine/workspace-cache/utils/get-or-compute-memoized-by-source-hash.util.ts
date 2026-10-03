import { isDefined } from 'twenty-shared/utils';

import { readLruEntry, writeLruEntry } from 'src/utils/lru-map.util';

export type SourceHashMemoEntry<TValue> = {
  sourceHash: string;
  value: TValue;
};

export const getOrComputeMemoizedBySourceHash = <TValue>({
  memo,
  memoKey,
  sourceHash,
  maxEntries,
  compute,
}: {
  memo: Map<string, SourceHashMemoEntry<TValue>>;
  memoKey: string;
  sourceHash: string;
  maxEntries: number;
  compute: () => TValue;
}): TValue => {
  const memoizedEntry = readLruEntry({ map: memo, key: memoKey });

  if (isDefined(memoizedEntry) && memoizedEntry.sourceHash === sourceHash) {
    return memoizedEntry.value;
  }

  const value = compute();

  writeLruEntry({
    map: memo,
    key: memoKey,
    value: { sourceHash, value },
    maxEntries,
  });

  return value;
};
