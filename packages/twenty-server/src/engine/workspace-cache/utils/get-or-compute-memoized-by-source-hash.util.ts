import { isDefined } from 'twenty-shared/utils';

import { readLruEntry, writeLruEntry } from 'src/utils/lru-map.util';

export type SourceHashMemoEntry<TValue> = {
  sourceHash: string;
  value: TValue;
  lastReadAt: number;
};

export const getOrComputeMemoizedBySourceHash = <TValue>({
  memo,
  memoKey,
  sourceHash,
  maxEntries,
  now,
  compute,
}: {
  memo: Map<string, SourceHashMemoEntry<TValue>>;
  memoKey: string;
  sourceHash: string;
  maxEntries: number;
  now: number;
  compute: () => TValue;
}): TValue => {
  const memoizedEntry = readLruEntry({ map: memo, key: memoKey });

  if (isDefined(memoizedEntry) && memoizedEntry.sourceHash === sourceHash) {
    memoizedEntry.lastReadAt = now;

    return memoizedEntry.value;
  }

  const value = compute();

  writeLruEntry({
    map: memo,
    key: memoKey,
    value: { sourceHash, value, lastReadAt: now },
    maxEntries,
  });

  return value;
};
