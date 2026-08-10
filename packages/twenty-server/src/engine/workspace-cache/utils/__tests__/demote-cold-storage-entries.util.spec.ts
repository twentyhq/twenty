import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { demoteColdStorageEntries } from 'src/engine/workspace-cache/utils/demote-cold-storage-entries.util';

const FIELD_METADATA = 'flat-maps:field-metadata';
const ORM = 'orm:entity-metadatas';

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

const demote = (
  localCache: Map<string, WorkspaceLocalCacheEntry<string>>,
  hotEntriesPerPrefix: number,
  overrides?: { serialize?: () => Buffer | undefined },
) =>
  demoteColdStorageEntries({
    localCache,
    keyNameByEligiblePrefix: new Map([
      [FIELD_METADATA, 'flatFieldMetadataMaps'],
    ]),
    hotEntriesPerPrefix,
    serialize: overrides?.serialize ?? serialize,
  });

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

  it('should never demote a provider that is not eligible', () => {
    const localCache = new Map([
      [`${ORM}:ws-a`, hotEntry(1)],
      [`${ORM}:ws-b`, hotEntry(2)],
    ]);

    expect(demote(localCache, 1)).toBe(0);
  });

  it('should not count an already cold entry against the hot budget', () => {
    const localCache = new Map([
      [`${FIELD_METADATA}:ws-cold`, coldEntry(1)],
      [`${FIELD_METADATA}:ws-hot`, hotEntry(2)],
    ]);

    expect(demote(localCache, 1)).toBe(0);
  });
});
