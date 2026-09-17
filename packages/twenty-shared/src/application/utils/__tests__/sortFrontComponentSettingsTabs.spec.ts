import { sortFrontComponentSettingsTabs } from '@/application/utils/sortFrontComponentSettingsTabs';

describe('sortFrontComponentSettingsTabs', () => {
  it('should order tabs by ascending position', () => {
    const sorted = sortFrontComponentSettingsTabs([
      { universalIdentifier: 'a', settingsTab: { position: 2 } },
      { universalIdentifier: 'b', settingsTab: { position: -1 } },
      { universalIdentifier: 'c', settingsTab: { position: 1 } },
    ]);

    expect(
      sorted.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['b', 'c', 'a']);
  });

  it('should break position ties on the universal identifier', () => {
    const sorted = sortFrontComponentSettingsTabs([
      { universalIdentifier: 'c', settingsTab: { position: 1 } },
      { universalIdentifier: 'a', settingsTab: { position: 1 } },
      { universalIdentifier: 'b', settingsTab: { position: 1 } },
    ]);

    expect(
      sorted.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['a', 'b', 'c']);
  });

  it('should treat a missing position as 0', () => {
    const sorted = sortFrontComponentSettingsTabs([
      { universalIdentifier: 'a', settingsTab: { position: 1 } },
      { universalIdentifier: 'b', settingsTab: {} },
      { universalIdentifier: 'c', settingsTab: null },
      { universalIdentifier: 'd' },
    ]);

    expect(
      sorted.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['b', 'c', 'd', 'a']);
  });

  it('should not mutate the given array', () => {
    const frontComponents = [
      { universalIdentifier: 'b', settingsTab: { position: 0 } },
      { universalIdentifier: 'a', settingsTab: { position: 0 } },
    ];

    sortFrontComponentSettingsTabs(frontComponents);

    expect(
      frontComponents.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['b', 'a']);
  });
});
