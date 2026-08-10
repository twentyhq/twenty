import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import {
  type LocalCacheSweepConfig,
  sweepLocalCache,
} from 'src/engine/workspace-cache/utils/sweep-local-cache.util';

const TTL_MS = 30 * 60 * 1000;
const ORM_KEY_NAME = 'ORMEntityMetadatas';

const entry = (lastReadAt: number): WorkspaceLocalCacheEntry<unknown> => ({
  versions: new Map([['h', { state: 'hot', data: {}, lastReadAt }]]),
  latestHash: 'h',
  lastHashCheckedAt: lastReadAt,
});

const config = (
  overrides: Partial<LocalCacheSweepConfig> = {},
): LocalCacheSweepConfig => ({
  ttlMs: TTL_MS,
  maxEntriesByKeyName: new Map(),
  globalMaxEntries: 6_000,
  minEvict: 0,
  ...overrides,
});

describe('sweepLocalCache', () => {
  it('drops entries idle past the TTL and keeps recent ones', () => {
    const cache = new Map([
      [`${ORM_KEY_NAME}:ws-idle`, entry(0)],
      [`${ORM_KEY_NAME}:ws-recent`, entry(TTL_MS)],
    ]);

    const evicted = sweepLocalCache(cache, TTL_MS + 1, config());

    expect(evicted).toBe(1);
    expect(cache.has(`${ORM_KEY_NAME}:ws-idle`)).toBe(false);
    expect(cache.has(`${ORM_KEY_NAME}:ws-recent`)).toBe(true);
  });

  it('trims a provider over its cap, evicting the least-recently-read', () => {
    const cache = new Map([
      [`${ORM_KEY_NAME}:ws-a`, entry(1)],
      [`${ORM_KEY_NAME}:ws-b`, entry(2)],
      [`${ORM_KEY_NAME}:ws-c`, entry(3)],
    ]);

    const evicted = sweepLocalCache(
      cache,
      100,
      config({ maxEntriesByKeyName: new Map([[ORM_KEY_NAME, 2]]) }),
    );

    expect(evicted).toBe(1);
    expect(cache.size).toBe(2);
    expect(cache.has(`${ORM_KEY_NAME}:ws-a`)).toBe(false); // oldest
    expect(cache.has(`${ORM_KEY_NAME}:ws-c`)).toBe(true); // newest
  });

  it('leaves a provider without a cap untouched', () => {
    const cache = new Map(
      Array.from({ length: 5 }, (_, index) => [
        `feature-flag:feature-flags-map:ws-${index}`,
        entry(index + 1),
      ]),
    );

    const evicted = sweepLocalCache(
      cache,
      100,
      config({ maxEntriesByKeyName: new Map([[ORM_KEY_NAME, 2]]) }),
    );

    expect(evicted).toBe(0);
    expect(cache.size).toBe(5);
  });

  it('trims the global total over the cap, batching by minEvict', () => {
    const cache = new Map(
      Array.from({ length: 10 }, (_, index) => [
        `feature-flag:feature-flags-map:ws-${index}`,
        entry(index + 1),
      ]),
    );

    const evicted = sweepLocalCache(
      cache,
      100,
      config({ globalMaxEntries: 6, minEvict: 4 }),
    );

    // 10 > 6, and minEvict=4 means at least 4 go — the four least-recently-read.
    expect(evicted).toBe(4);
    expect(cache.size).toBe(6);
    expect(cache.has('feature-flag:feature-flags-map:ws-0')).toBe(false);
    expect(cache.has('feature-flag:feature-flags-map:ws-9')).toBe(true);
  });

  it('expires first so the per-provider cap only counts survivors', () => {
    const cache = new Map([
      [`${ORM_KEY_NAME}:ws-idle`, entry(0)], // expired by TTL
      [`${ORM_KEY_NAME}:ws-a`, entry(TTL_MS + 1)],
      [`${ORM_KEY_NAME}:ws-b`, entry(TTL_MS + 2)],
    ]);

    const evicted = sweepLocalCache(
      cache,
      TTL_MS + 10,
      config({ maxEntriesByKeyName: new Map([[ORM_KEY_NAME, 2]]) }),
    );

    // The idle one is expired; the two survivors are within the cap, so nothing else goes.
    expect(evicted).toBe(1);
    expect(cache.size).toBe(2);
  });
});
