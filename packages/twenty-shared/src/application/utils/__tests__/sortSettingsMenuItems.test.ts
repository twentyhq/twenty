import { sortSettingsMenuItems } from '@/application/utils/sortSettingsMenuItems';

describe('sortSettingsMenuItems', () => {
  it('should order pages by ascending position', () => {
    const sorted = sortSettingsMenuItems([
      { universalIdentifier: 'c', position: 2 },
      { universalIdentifier: 'a', position: 0 },
      { universalIdentifier: 'b', position: 1 },
    ]);

    expect(
      sorted.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['a', 'b', 'c']);
  });

  it('should break a position tie on universalIdentifier so the order is stable across installs', () => {
    const sorted = sortSettingsMenuItems([
      { universalIdentifier: 'b', position: 1 },
      { universalIdentifier: 'a', position: 1 },
    ]);

    expect(
      sorted.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['a', 'b']);
  });

  it('should treat a missing position as 0', () => {
    const sorted = sortSettingsMenuItems([
      { universalIdentifier: 'b', position: 1 },
      { universalIdentifier: 'a' },
    ]);

    expect(
      sorted.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['a', 'b']);
  });

  it('should support fractional positions so a page can be slotted between two others', () => {
    const sorted = sortSettingsMenuItems([
      { universalIdentifier: 'c', position: 2 },
      { universalIdentifier: 'b', position: 1.5 },
      { universalIdentifier: 'a', position: 1 },
    ]);

    expect(
      sorted.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['a', 'b', 'c']);
  });

  it('should not mutate the given array', () => {
    const settingsMenuItems = [
      { universalIdentifier: 'b', position: 1 },
      { universalIdentifier: 'a', position: 0 },
    ];

    sortSettingsMenuItems(settingsMenuItems);

    expect(
      settingsMenuItems.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['b', 'a']);
  });
});
