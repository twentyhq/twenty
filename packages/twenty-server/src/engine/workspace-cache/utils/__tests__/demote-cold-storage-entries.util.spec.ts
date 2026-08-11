import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { demoteColdStorageEntries } from 'src/engine/workspace-cache/utils/demote-cold-storage-entries.util';

const FIELD_METADATA = 'flatFieldMetadataMaps';
const ORM = 'ORMEntityMetadatas';

const hotEntry = (lastReadAt: number): WorkspaceLocalCacheEntry<string> => ({
  versions: new Map([['hash-1', { state: 'hot', data: 'data', lastReadAt }]]),
  latestHash: 'hash-1',
  lastHashCheckedAt: lastReadAt,
});

const coldEntry = (lastReadAt: number): WorkspaceLocalCacheEntry<string> => ({
  versions: new Map([
    ['hash-1', { state: 'cold', blob: Buffer.from('{}'), lastReadAt }],
  ]),
  latestHash: 'hash-1',
  lastHashCheckedAt: lastReadAt,
});

const serialize = () => Buffer.from('serialized');

const NO_BUDGET_LIMIT = Number.POSITIVE_INFINITY;

const demote = (
  localCache: Map<string, WorkspaceLocalCacheEntry<string>>,
  hotEntriesPerProvider: number,
  overrides?: {
    serialize?: () => Buffer | undefined;
    budgetMs?: number;
    now?: () => number;
  },
) =>
  demoteColdStorageEntries({
    localCache,
    hotEntriesPerProvider,
    budgetMs: overrides?.budgetMs ?? NO_BUDGET_LIMIT,
    serialize: overrides?.serialize ?? serialize,
    now: overrides?.now,
  }).demoted;

describe('demoteColdStorageEntries', () => {
  it('should demote nothing when the provider is within its hot budget', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-a`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-b`, hotEntry(2)],
    ]);

    expect(demote(localCache, 2)).toBe(0);
    expect(
      localCache.get(`${FIELD_METADATA}:ws-a`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'hot' });
  });

  it('should demote the least recently read entries beyond the hot budget', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-newest`, hotEntry(9)],
      [`${FIELD_METADATA}:ws-oldest`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-middle`, hotEntry(5)],
    ]);

    expect(demote(localCache, 1)).toBe(2);
    expect(
      localCache.get(`${FIELD_METADATA}:ws-oldest`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'cold', blob: Buffer.from('serialized') });
    expect(
      localCache.get(`${FIELD_METADATA}:ws-newest`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'hot' });
  });

  it('should preserve lastReadAt so a demoted entry keeps its place in the eviction order', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-a`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-b`, hotEntry(2)],
    ]);

    demote(localCache, 1);

    expect(
      localCache.get(`${FIELD_METADATA}:ws-a`)?.versions.get('hash-1'),
    ).toMatchObject({ lastReadAt: 1 });
  });

  it('should leave the entry hot when serialize declines it', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-a`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-b`, hotEntry(2)],
    ]);

    expect(demote(localCache, 1, { serialize: () => undefined })).toBe(0);
    expect(
      localCache.get(`${FIELD_METADATA}:ws-a`)?.versions.get('hash-1'),
    ).toMatchObject({ state: 'hot' });
  });

  it('should budget each provider independently', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-a`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-b`, hotEntry(2)],
      [`${ORM}:ws-a`, hotEntry(3)],
    ]);

    expect(demote(localCache, 1)).toBe(1);
    expect(localCache.get(`${ORM}:ws-a`)?.versions.get('hash-1')).toMatchObject(
      {
        state: 'hot',
      },
    );
  });

  it('should not count an already cold entry against the hot budget', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-cold`, coldEntry(1)],
      [`${FIELD_METADATA}:ws-hot`, hotEntry(2)],
    ]);

    expect(demote(localCache, 1)).toBe(0);
  });

  describe('time budget', () => {
    const clockAdvancingPerEntry = () => {
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
          hotEntry(index),
        ]),
      );

    it('should stop once the budget is spent instead of draining the backlog', () => {
      const localCache = buildCache(10);

      const result = demoteColdStorageEntries({
        localCache,
        hotEntriesPerProvider: 0,
        budgetMs: 25,
        serialize,
        now: clockAdvancingPerEntry(),
      });

      expect(result.demoted).toBe(2);
      expect(result.remaining).toBe(8);
    });

    it('should demote coldest first so an interrupted slice leaves the hottest behind', () => {
      const localCache = buildCache(10);

      demoteColdStorageEntries({
        localCache,
        hotEntriesPerProvider: 0,
        budgetMs: 25,
        serialize,
        now: clockAdvancingPerEntry(),
      });

      expect(
        localCache.get(`${FIELD_METADATA}:ws-0`)?.versions.get('hash-1'),
      ).toMatchObject({ state: 'cold' });
      expect(
        localCache.get(`${FIELD_METADATA}:ws-9`)?.versions.get('hash-1'),
      ).toMatchObject({ state: 'hot' });
    });

    it('should converge across successive slices without a cursor', () => {
      const localCache = buildCache(10);
      let slices = 0;
      let remaining = Number.POSITIVE_INFINITY;

      while (remaining > 0 && slices < 10) {
        remaining = demoteColdStorageEntries({
          localCache,
          hotEntriesPerProvider: 0,
          budgetMs: 25,
          serialize,
          now: clockAdvancingPerEntry(),
        }).remaining;
        slices += 1;
      }

      expect(remaining).toBe(0);
      expect(slices).toBe(5);
      expect(
        [...localCache.values()].every(
          (entry) => entry.versions.get('hash-1')?.state === 'cold',
        ),
      ).toBe(true);
    });
  });
});
