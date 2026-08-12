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
  ponderationBudget: number,
  overrides?: {
    pack?: () => Buffer | undefined;
    isPackable?: (localKey: string) => boolean;
    ponderationOf?: (localKey: string) => number;
  },
) =>
  packIdleVersions({
    localCache,
    minIdleMs: IDLE_MS,
    ponderationBudget,
    ponderationOf: overrides?.ponderationOf ?? (() => 1),
    isPackable: overrides?.isPackable ?? (() => true),
    pack: overrides?.pack ?? pack,
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

    expect(run(localCache, 2, { pack: () => undefined }).packed).toBe(0);
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-a`)).toBe('live');
  });

  it('should not let an unpackable provider starve the versions behind it', () => {
    const localCache = new Map([
      [`${ORM}:ws-coldest`, liveEntry(IDLE - 2_000)],
      [`${ORM}:ws-colder`, liveEntry(IDLE - 1_000)],
      [`${FIELD_METADATA}:ws-warm`, liveEntry(IDLE)],
    ]);

    const result = run(localCache, 2, {
      isPackable: (localKey) => !localKey.startsWith(ORM),
    });

    expect(result.packed).toBe(1);
    expect(result.pending).toBe(0);
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-warm`)).toBe('packed');
    expect(stateOf(localCache, `${ORM}:ws-coldest`)).toBe('live');
  });

  it('should ignore versions that are already packed', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-packed`, packedEntry(IDLE)],
    ]);

    const result = run(localCache, 2);

    expect(result.packed).toBe(0);
    expect(result.pending).toBe(0);
  });

  it('should never pack a provider heavier than the whole budget', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-heavy`, liveEntry(IDLE - 1_000)],
      [`${ORM}:ws-light`, liveEntry(IDLE)],
    ]);

    const result = run(localCache, 8, {
      ponderationOf: (localKey) =>
        localKey.startsWith(FIELD_METADATA) ? 64 : 1,
    });

    expect(result.packed).toBe(1);
    expect(result.pending).toBe(0);
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-heavy`)).toBe('live');
    expect(stateOf(localCache, `${ORM}:ws-light`)).toBe('packed');
  });

  it('should stop once the ponderation budget is spent', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-a`, liveEntry(IDLE - 3_000)],
      [`${FIELD_METADATA}:ws-b`, liveEntry(IDLE - 2_000)],
      [`${FIELD_METADATA}:ws-c`, liveEntry(IDLE - 1_000)],
    ]);

    const result = run(localCache, 4, { ponderationOf: () => 3 });

    expect(result.packed).toBe(1);
    expect(result.pending).toBe(2);
  });

  it('should skip a candidate that does not fit and pack a lighter one behind it', () => {
    const ponderationBySuffix: Record<string, number> = {
      'ws-med': 2,
      'ws-heavy': 3,
      'ws-light': 1,
    };
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-med`, liveEntry(IDLE - 3_000)],
      [`${FIELD_METADATA}:ws-heavy`, liveEntry(IDLE - 2_000)],
      [`${FIELD_METADATA}:ws-light`, liveEntry(IDLE - 1_000)],
    ]);

    const result = run(localCache, 4, {
      ponderationOf: (localKey) =>
        ponderationBySuffix[localKey.split(':')[1]] ?? 1,
    });

    // med (2) is packed, heavy (3) does not fit the remaining budget and is
    // skipped, light (1) behind it still fits and is packed.
    expect(result.packed).toBe(2);
    expect(result.pending).toBe(1);
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-med`)).toBe('packed');
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-heavy`)).toBe('live');
    expect(stateOf(localCache, `${FIELD_METADATA}:ws-light`)).toBe('packed');
  });
});
