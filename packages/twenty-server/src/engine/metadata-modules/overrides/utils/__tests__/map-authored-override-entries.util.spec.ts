import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

describe('mapAuthoredOverrideEntries', () => {
  it('maps every entry and keeps its author key', () => {
    expect(
      mapAuthoredOverrideEntries(
        { [CUSTOM]: { viewId: 'view-1' }, [OWNER]: { viewId: 'view-2' } },
        ({ viewId }) => ({ viewUniversalIdentifier: `universal-${viewId}` }),
      ),
    ).toEqual({
      [CUSTOM]: { viewUniversalIdentifier: 'universal-view-1' },
      [OWNER]: { viewUniversalIdentifier: 'universal-view-2' },
    });
  });

  it('drops undefined entries and maps an empty map to an empty map', () => {
    const mapEntry = jest.fn((entry: { name: string }) => entry);

    expect(
      mapAuthoredOverrideEntries({ [CUSTOM]: undefined }, mapEntry),
    ).toEqual({});
    expect(mapAuthoredOverrideEntries({}, mapEntry)).toEqual({});
    expect(mapEntry).not.toHaveBeenCalled();
  });
});
