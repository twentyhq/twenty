import { computeLocalCacheStats } from 'src/engine/workspace-cache/utils/compute-local-cache-stats.util';

const entry = (state: 'live' | 'packed' = 'live') => ({
  version:
    state === 'live'
      ? { state: 'live' as const, data: 'data', lastReadAt: 0 }
      : { state: 'packed' as const, blob: Buffer.alloc(100), lastReadAt: 0 },
});

describe('computeLocalCacheStats', () => {
  it('returns zeros for an empty cache', () => {
    const stats = computeLocalCacheStats(new Map());

    expect(stats).toEqual({
      entries: 0,
      workspaces: 0,
      entriesByKeyName: {},
      liveVersionsByKeyName: {},
      packedVersionsByKeyName: {},
      packedBytesByKeyName: {},
      liveVersionsTotal: 0,
      packedVersionsTotal: 0,
      packedBytesTotal: 0,
    });
  });

  it('counts entries and distinct workspaces', () => {
    const stats = computeLocalCacheStats(
      new Map([
        ['ORMEntityMetadatas:ws-a', entry()],
        ['flatFieldMetadataMaps:ws-a', entry()],
        ['ORMEntityMetadatas:ws-b', entry()],
      ]),
    );

    expect(stats.entries).toBe(3);
    // ws-a and ws-b — the same workspace under two providers counts once.
    expect(stats.workspaces).toBe(2);
    expect(stats.entriesByKeyName).toEqual({
      ORMEntityMetadatas: 2,
      flatFieldMetadataMaps: 1,
    });
  });

  it('splits versions by storage state and sums exact packed bytes', () => {
    const stats = computeLocalCacheStats(
      new Map([
        ['flatFieldMetadataMaps:ws-a', entry('packed')],
        ['flatFieldMetadataMaps:ws-c', entry('packed')],
        ['flatFieldMetadataMaps:ws-b', entry('live')],
        ['ORMEntityMetadatas:ws-a', entry('live')],
      ]),
    );

    expect(stats.liveVersionsTotal).toBe(2);
    expect(stats.packedVersionsTotal).toBe(2);
    expect(stats.packedBytesTotal).toBe(200);
    expect(stats.packedVersionsByKeyName).toEqual({
      flatFieldMetadataMaps: 2,
      ORMEntityMetadatas: 0,
    });
    expect(stats.liveVersionsByKeyName).toEqual({
      flatFieldMetadataMaps: 1,
      ORMEntityMetadatas: 1,
    });
  });
});
