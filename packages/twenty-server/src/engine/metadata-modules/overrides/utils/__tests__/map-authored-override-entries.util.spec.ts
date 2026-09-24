import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

type ViewEntry = { viewId?: string; name?: string };

const toUniversal = ({ viewId, ...rest }: ViewEntry) => ({
  ...rest,
  viewUniversalIdentifier: `universal-${viewId}`,
});

describe('mapAuthoredOverrideEntries', () => {
  it('maps every entry and keeps its author key', () => {
    expect(
      mapAuthoredOverrideEntries({
        metadataName: 'viewField',
        overrides: {
          [CUSTOM]: { viewId: 'view-1' },
          [OWNER]: { viewId: 'view-2' },
        },
        mapEntry: toUniversal,
      }),
    ).toEqual({
      [CUSTOM]: { viewUniversalIdentifier: 'universal-view-1' },
      [OWNER]: { viewUniversalIdentifier: 'universal-view-2' },
    });
  });

  it('maps a legacy flat blob as a single entry without keying it', () => {
    expect(
      mapAuthoredOverrideEntries({
        metadataName: 'view',
        overrides: { name: 'Mine', viewId: 'view-1' } as never,
        mapEntry: toUniversal,
      }),
    ).toEqual({ name: 'Mine', viewUniversalIdentifier: 'universal-view-1' });
  });

  it('drops undefined entries and maps an empty map to an empty map', () => {
    const mapEntry = jest.fn((entry: { name: string }) => entry);

    expect(
      mapAuthoredOverrideEntries({
        metadataName: 'view',
        overrides: { [CUSTOM]: undefined },
        mapEntry,
      }),
    ).toEqual({});
    expect(
      mapAuthoredOverrideEntries({
        metadataName: 'view',
        overrides: {},
        mapEntry,
      }),
    ).toEqual({});
    expect(mapEntry).not.toHaveBeenCalled();
  });
});
