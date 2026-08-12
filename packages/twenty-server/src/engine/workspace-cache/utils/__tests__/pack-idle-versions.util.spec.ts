import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { packIdleVersions } from 'src/engine/workspace-cache/utils/pack-idle-versions.util';

const FIELD_METADATA = 'flatFieldMetadataMaps';
const ORM = 'ORMEntityMetadatas';

const NOW_EPOCH_MS = 1_000_000;
const IDLE_MS = 60_000;
const IDLE = NOW_EPOCH_MS - 90_000;
const RECENT = NOW_EPOCH_MS - 1_000;

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
  maxEntryVersionsPerRun: number,
  packOverride?: () => Buffer | undefined,
) =>
  packIdleVersions({
    localCache,
    minIdleMs: IDLE_MS,
    maxEntryVersionsPerRun,
    pack: packOverride ?? pack,
    nowEpochMs: () => NOW_EPOCH_MS,
  });

const stateOf = (
  localCache: Map<string, WorkspaceLocalCacheEntry<string>>,
  localKey: string,
) => localCache.get(localKey)?.versions.get('hash-1')?.state;

describe('packIdleVersions', () => {
  it('should pack a version that has gone idle', () => {
    const localCache = new Map([[`${FIELD_METADATA}:ws-a`, liveEntry(IDLE)]]);

    expect(run(localCache, 2).packed).toBe(1);
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-a`)).toBe('packed');
  });

  it('should leave a version read inside the idle window live', () => {
    const localCache = new Map([[`${FIELD_METADATA}:ws-a`, liveEntry(RECENT)]]);

    expect(run(localCache, 2).packed).toBe(0);
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-a`)).toBe('live');
  });

  it('should pack no more than one run allows, coldest first', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-coldest`, liveEntry(IDLE - 2_000)],
      [`${FIELD_METADATA}:ws-colder`, liveEntry(IDLE - 1_000)],
      [`${ORM}:ws-warm`, liveEntry(IDLE)],
    ]);

    const result = run(localCache, 2);

    expect(result.packed).toBe(2);
    expect(result.pending).toBe(1);
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-coldest`)).toBe('packed');
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-colder`)).toBe('packed');
    expect(stateOf(localCache, `${ORM}:ws-warm`)).toBe('live');
  });

  it('should converge across successive runs', () => {
    const localCache = new Map(
      Array.from({ length: 5 }, (_, index) => [
        `${FIELD_METADATA}:ws-${index}`,
        liveEntry(IDLE - index),
      ]),
    );
    let pending = Number.POSITIVE_INFINITY;
    let runs = 0;

    while (pending > 0 && runs < 10) {
      pending = run(localCache, 2).pending;
      runs += 1;
    }

    expect(runs).toBe(3);
    expect(
      [...localCache.values()].every(
        (entry) => entry.versions.get('hash-1')?.state === 'packed',
      ),
    ).toBe(true);
  });

  it('should preserve lastReadAt so a packed version keeps its place in the eviction order', () => {
    const localCache = new Map([[`${FIELD_METADATA}:ws-a`, liveEntry(IDLE)]]);

    run(localCache, 2);

    expect(
      localCache.get(`${FIELD_METADATA}:ws-a`)?.versions.get('hash-1'),
    ).toMatchObject({ lastReadAt: IDLE });
  });

  it('should leave the version live when pack declines it', () => {
    const localCache = new Map([[`${FIELD_METADATA}:ws-a`, liveEntry(IDLE)]]);

    expect(run(localCache, 2, () => undefined).packed).toBe(0);
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-a`)).toBe('live');
  });

  it('should ignore versions that are already packed', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-packed`, packedEntry(IDLE)],
    ]);

    const result = run(localCache, 2);

    expect(result.packed).toBe(0);
    expect(result.pending).toBe(0);
  });
});
