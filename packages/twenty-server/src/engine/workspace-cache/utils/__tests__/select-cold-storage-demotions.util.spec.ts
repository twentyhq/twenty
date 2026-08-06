import { type WorkspaceLocalCacheEntry } from 'src/engine/workspace-cache/types/workspace-local-cache-entry.type';
import { selectColdStorageDemotions } from 'src/engine/workspace-cache/utils/select-cold-storage-demotions.util';

const FIELD_METADATA = 'flat-maps:field-metadata';
const ORM = 'orm:entity-metadatas';

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

describe('selectColdStorageDemotions', () => {
  it('should demote nothing when the provider is within its hot budget', () => {
    const cache = new Map([
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
    const cache = new Map([
      [`${FIELD_METADATA}:ws-newest`, hotEntry(9)],
      [`${FIELD_METADATA}:ws-oldest`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-middle`, hotEntry(5)],
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

  it('should never demote an ineligible provider', () => {
    const cache = new Map([
      [`${ORM}:ws-a`, hotEntry(1)],
      [`${ORM}:ws-b`, hotEntry(2)],
    ]);

    expect(
      selectColdStorageDemotions(cache, {
        eligiblePrefixes: new Set([FIELD_METADATA]),
        hotEntriesPerPrefix: 1,
      }),
    ).toEqual([]);
  });

  it('should budget each eligible provider independently', () => {
    const cache = new Map([
      [`${FIELD_METADATA}:ws-a`, hotEntry(1)],
      [`${FIELD_METADATA}:ws-b`, hotEntry(2)],
      ['flat-maps:view-field:ws-a', hotEntry(3)],
    ]);

    expect(
      selectColdStorageDemotions(cache, {
        eligiblePrefixes: new Set([FIELD_METADATA, 'flat-maps:view-field']),
        hotEntriesPerPrefix: 1,
      }),
    ).toEqual([{ localKey: `${FIELD_METADATA}:ws-a`, hash: 'hash-1' }]);
  });

  it('should not count an already cold entry against the hot budget', () => {
    const cache = new Map([
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
