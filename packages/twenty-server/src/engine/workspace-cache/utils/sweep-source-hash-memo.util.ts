import { type SourceHashMemoEntry } from 'src/engine/workspace-cache/utils/get-or-compute-memoized-by-source-hash.util';

export const sweepSourceHashMemo = <TValue>({
  memo,
  now,
  ttlMs,
}: {
  memo: Map<string, Pick<SourceHashMemoEntry<TValue>, 'lastReadAt'>>;
  now: number;
  ttlMs: number;
}): number => {
  let evicted = 0;

  for (const [memoKey, memoEntry] of memo) {
    if (now - memoEntry.lastReadAt > ttlMs) {
      memo.delete(memoKey);
      evicted += 1;
    }
  }

  return evicted;
};
