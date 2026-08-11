import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { packIdleVersions } from 'src/engine/workspace-cache/utils/pack-idle-versions.util';

const FIELD_METADATA = 'flatFieldMetadataMaps';
const ORM = 'ORMEntityMetadatas';

const NOW_EPOCH_MS = 100_000;
const NO_BUDGET_LIMIT = Number.POSITIVE_INFINITY;

const liveEntry = (lastReadAt: number): WorkspaceLocalCacheEntry<string> => ({
  versions: new Map([['hash-1', { state: 'live', data: 'data', lastReadAt }]]),
  latestHash: 'hash-1',
  lastHashCheckedAt: lastReadAt,
});

const packedEntry = (lastReadAt: number): WorkspaceLocalCacheEntry<string> => ({
  versions: new Map([
    ['hash-1', { state: 'packed', blob: Buffer.from('{}'), lastReadAt }],
  ]),
  latestHash: 'hash-1',
  lastHashCheckedAt: lastReadAt,
});

const pack = () => Buffer.from('packed');

const run = (
  localCache: Map<string, WorkspaceLocalCacheEntry<string>>,
  liveVersionsPerProvider: number,
  overrides?: {
    pack?: () => Buffer | undefined;
    budgetMs?: number;
    minIdleMs?: number;
    packCostEstimateMs?: number;
    now?: () => number;
  },
) =>
  packIdleVersions({
    localCache,
    liveVersionsPerProvider,
    minIdleMs: overrides?.minIdleMs ?? 0,
    budgetMs: overrides?.budgetMs ?? NO_BUDGET_LIMIT,
    packCostEstimateMs: overrides?.packCostEstimateMs ?? 0,
    pack: overrides?.pack ?? pack,
    now: overrides?.now,
    nowEpochMs: () => NOW_EPOCH_MS,
  });

describe('packIdleVersions', () => {
  it('should pack nothing when the provider is within its live budget', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-a`, liveEntry(1)],
      [`${FIELD_METADATA}:ws-b`, liveEntry(2)],
    ]);

    expect(run(localCache, 2).packed).toBe(0);
  });

  it('should pack the least recently read versions beyond the live budget', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-newest`, liveEntry(9)],
      [`${FIELD_METADATA}:ws-oldest`, liveEntry(1)],
      [`${FIELD_METADATA}:ws-middle`, liveEntry(5)],
    ]);

    expect(run(localCache, 1).packed).toBe(2);
    expect(
      localCache.get(`${FIELD_METADATA}:ws-oldest`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'packed', blob: Buffer.from('packed') });
    expect(
      localCache.get(`${FIELD_METADATA}:ws-newest`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'live' });
  });

  it('should count versions read inside the idle window against the provider budget without packing them', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-recent-a`, liveEntry(NOW_EPOCH_MS - 1_000)],
      [`${FIELD_METADATA}:ws-recent-b`, liveEntry(NOW_EPOCH_MS - 2_000)],
      [`${FIELD_METADATA}:ws-idle`, liveEntry(NOW_EPOCH_MS - 90_000)],
    ]);

    expect(run(localCache, 2, { minIdleMs: 60_000 }).packed).toBe(1);
    expect(
      localCache.get(`${FIELD_METADATA}:ws-idle`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'packed' });
  });

  it('should leave versions read inside the idle window alone, whatever the budget', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-recent`, liveEntry(NOW_EPOCH_MS - 1_000)],
      [`${FIELD_METADATA}:ws-idle`, liveEntry(NOW_EPOCH_MS - 90_000)],
    ]);

    expect(run(localCache, 0, { minIdleMs: 60_000 }).packed).toBe(1);
    expect(
      localCache.get(`${FIELD_METADATA}:ws-recent`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'live' });
    expect(
      localCache.get(`${FIELD_METADATA}:ws-idle`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'packed' });
  });

  it('should preserve lastReadAt so a packed version keeps its place in the eviction order', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-a`, liveEntry(1)],
      [`${FIELD_METADATA}:ws-b`, liveEntry(2)],
    ]);

    run(localCache, 1);

    expect(
      localCache.get(`${FIELD_METADATA}:ws-a`)?.versions.get('hash-1'),
    ).toMatchObject({ lastReadAt: 1 });
  });

  it('should leave the version live when pack declines it', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-a`, liveEntry(1)],
      [`${FIELD_METADATA}:ws-b`, liveEntry(2)],
    ]);

    expect(run(localCache, 1, { pack: () => undefined }).packed).toBe(0);
    expect(
      localCache.get(`${FIELD_METADATA}:ws-a`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'live' });
  });

  it('should budget each provider independently', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-a`, liveEntry(1)],
      [`${FIELD_METADATA}:ws-b`, liveEntry(2)],
      [`${ORM}:ws-a`, liveEntry(3)],
    ]);

    expect(run(localCache, 1).packed).toBe(1);
    expect(localCache.get(`${ORM}:ws-a`)?.versions.get('hash-1')).toMatchObject(
      {
        state: 'live',
      },
    );
  });

  it('should not count an already packed version against the live budget', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-packed`, packedEntry(1)],
      [`${FIELD_METADATA}:ws-live`, liveEntry(2)],
    ]);

    expect(run(localCache, 1).packed).toBe(0);
  });

  describe('time budget', () => {
    const clockAdvancingPerCall = () => {
      let elapsed = 0;

      return () => {
        const current = elapsed;

        elapsed += 10;

        return current;
      };
    };

    const buildCache = (count: number) =>
      new Map(
        Array.from({ length: count }, (_, index) => [
          `${FIELD_METADATA}:ws-${index}`,
          liveEntry(index),
        ]),
      );

    it('should keep packing one version per slice when a single pack costs more than the whole budget', () => {
      const localCache = buildCache(3);
      let estimate = 40;
      let remaining = Number.POSITIVE_INFINITY;
      let slices = 0;

      while (remaining > 0 && slices < 10) {
        const result = run(localCache, 0, {
          budgetMs: 25,
          packCostEstimateMs: estimate,
          now: clockAdvancingPerCall(),
        });

        expect(result.packed).toBe(1);
        estimate = result.packCostEstimateMs;
        remaining = result.remaining;
        slices += 1;
      }

      expect(slices).toBe(3);
      expect(
        [...localCache.values()].every(
          (entry) => entry.versions.get('hash-1')?.state === 'packed',
        ),
      ).toBe(true);
    });

    it('should stop the rest of the slice once the carried estimate no longer fits', () => {
      const result = run(buildCache(10), 0, {
        budgetMs: 25,
        packCostEstimateMs: 40,
        now: clockAdvancingPerCall(),
      });

      expect(result.packed).toBe(1);
      expect(result.remaining).toBe(9);
    });

    it('should report the costliest pack so the next slice can budget for it', () => {
      const result = run(buildCache(10), 0, {
        budgetMs: 25,
        now: clockAdvancingPerCall(),
      });

      expect(result.packCostEstimateMs).toBe(10);
    });

    it('should stop before a pack the budget cannot absorb rather than overrunning it', () => {
      const result = run(buildCache(10), 0, {
        budgetMs: 25,
        now: clockAdvancingPerCall(),
      });

      expect(result.packed).toBe(1);
      expect(result.remaining).toBe(9);
    });

    it('should pack coldest first so an interrupted slice leaves the hottest behind', () => {
      const localCache = buildCache(10);

      run(localCache, 0, { budgetMs: 25, now: clockAdvancingPerCall() });

      expect(
        localCache.get(`${FIELD_METADATA}:ws-0`)?.versions.get('hash-1'),
      ).toMatchObject({ state: 'packed' });
      expect(
        localCache.get(`${FIELD_METADATA}:ws-9`)?.versions.get('hash-1'),
      ).toMatchObject({ state: 'live' });
    });

    it('should converge across successive slices without a cursor', () => {
      const localCache = buildCache(10);
      let slices = 0;
      let remaining = Number.POSITIVE_INFINITY;

      while (remaining > 0 && slices < 20) {
        remaining = run(localCache, 0, {
          budgetMs: 25,
          now: clockAdvancingPerCall(),
        }).remaining;
        slices += 1;
      }

      expect(remaining).toBe(0);
      expect(
        [...localCache.values()].every(
          (entry) => entry.versions.get('hash-1')?.state === 'packed',
        ),
      ).toBe(true);
    });
  });
});
