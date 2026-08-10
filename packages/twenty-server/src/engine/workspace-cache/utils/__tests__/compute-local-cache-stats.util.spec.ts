import { computeLocalCacheStats } from 'src/engine/workspace-cache/utils/compute-local-cache-stats.util';

const entry = (versionCount: number) => ({ versions: { size: versionCount } });

describe('computeLocalCacheStats', () => {
  it('returns zeros for an empty cache', () => {
    const stats = computeLocalCacheStats(new Map());

    expect(stats).toEqual({
      entries: 0,
      workspaces: 0,
      versionsTotal: 0,
      versionsByCount: { '1': 0, '2': 0, '3': 0, '4': 0, '5+': 0 },
      entriesByProvider: {},
    });
  });

  it('counts entries, distinct workspaces, and total versions', () => {
    const stats = computeLocalCacheStats(
      new Map([
        ['ORMEntityMetadatas:ws-a', entry(1)],
        ['flatFieldMetadataMaps:ws-a', entry(2)],
        ['ORMEntityMetadatas:ws-b', entry(1)],
      ]),
    );

    expect(stats.entries).toBe(3);
    // ws-a and ws-b — the same workspace under two providers counts once.
    expect(stats.workspaces).toBe(2);
    expect(stats.versionsTotal).toBe(4);
    expect(stats.entriesByProvider).toEqual({
      ORMEntityMetadatas: 2,
      flatFieldMetadataMaps: 1,
    });
  });

  it('buckets entries by version count and folds 5+ together', () => {
    const stats = computeLocalCacheStats(
      new Map([
        ['p:ws-1', entry(1)],
        ['p:ws-2', entry(2)],
        ['p:ws-3', entry(4)],
        ['p:ws-4', entry(5)],
        ['p:ws-5', entry(9)],
      ]),
    );

    expect(stats.versionsByCount).toEqual({
      '1': 1,
      '2': 1,
      '3': 0,
      '4': 1,
      '5+': 2,
    });
  });
});
