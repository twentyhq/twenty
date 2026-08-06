import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { selectColdStorageDemotions } from 'src/engine/workspace-cache/utils/select-cold-storage-demotions.util';

const hotEntry = (lastReadAt: number): WorkspaceLocalCacheEntry<unknown> => ({
  versions: new Map([['hash-1', { state: 'hot', data: {}, lastReadAt }]]),
  latestHash: 'hash-1',
  lastHashCheckedAt: lastReadAt,
});

const coldEntry = (lastReadAt: number): WorkspaceLocalCacheEntry<unknown> => ({
  versions: new Map([
    ['hash-1', { state: 'cold', blob: Buffer.from('{}'), lastReadAt }],
  ]),
  latestHash: 'hash-1',
  lastHashCheckedAt: lastReadAt,
});

const buildCache = (
  entries: [string, WorkspaceLocalCacheEntry<unknown>][],
): Map<string, WorkspaceLocalCacheEntry<unknown>> => new Map(entries);

const FIELD_METADATA = 'flat-maps:field-metadata';
const ORM = 'orm:entity-metadatas';

describe('selectColdStorageDemotions', () => {
  it('should demote nothing when the provider is within its hot budget', () => {
    const cache = buildCache([
      [`${FIELD_METADATA}:ws-a`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-b`, hotEntry(2)],
    ]);

    expect(
      selectColdStorageDemotions(cache, {
        eligiblePrefixes: new Set([FIELD_METADATA]),
        hotEntriesPerPrefix: 2,
      }),
    ).toEqual([]);
  });

  it('should demote the least recently read entries beyond the hot budget', () => {
    const cache = buildCache([
      [`${FIELD_METADATA}:ws-oldest`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-middle`, hotEntry(5)],
      [`${FIELD_METADATA}:ws-newest`, hotEntry(9)],
    ]);

    expect(
      selectColdStorageDemotions(cache, {
        eligiblePrefixes: new Set([FIELD_METADATA]),
        hotEntriesPerPrefix: 1,
      }),
    ).toEqual([
      { localKey: `${FIELD_METADATA}:ws-oldest`, hash: 'hash-1' },
      { localKey: `${FIELD_METADATA}:ws-middle`, hash: 'hash-1' },
    ]);
  });

  it('should never demote a provider that is not eligible', () => {
    const cache = buildCache([
      [`${ORM}:ws-a`, hotEntry(1)],
      [`${ORM}:ws-b`, hotEntry(2)],
      [`${ORM}:ws-c`, hotEntry(3)],
    ]);

    expect(
      selectColdStorageDemotions(cache, {
        eligiblePrefixes: new Set([FIELD_METADATA]),
        hotEntriesPerPrefix: 1,
      }),
    ).toEqual([]);
  });

  it('should budget each provider independently', () => {
    const cache = buildCache([
      [`${FIELD_METADATA}:ws-a`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-b`, hotEntry(2)],
      ['flat-maps:view-field:ws-a', hotEntry(3)],
      ['flat-maps:view-field:ws-b', hotEntry(4)],
    ]);

    expect(
      selectColdStorageDemotions(cache, {
        eligiblePrefixes: new Set([FIELD_METADATA, 'flat-maps:view-field']),
        hotEntriesPerPrefix: 1,
      }),
    ).toEqual([
      { localKey: `${FIELD_METADATA}:ws-a`, hash: 'hash-1' },
      { localKey: 'flat-maps:view-field:ws-a', hash: 'hash-1' },
    ]);
  });

  it('should ignore versions that are already cold when counting the hot budget', () => {
    const cache = buildCache([
      [`${FIELD_METADATA}:ws-cold`, coldEntry(1)],
      [`${FIELD_METADATA}:ws-hot`, hotEntry(2)],
    ]);

    expect(
      selectColdStorageDemotions(cache, {
        eligiblePrefixes: new Set([FIELD_METADATA]),
        hotEntriesPerPrefix: 1,
      }),
    ).toEqual([]);
  });
});
