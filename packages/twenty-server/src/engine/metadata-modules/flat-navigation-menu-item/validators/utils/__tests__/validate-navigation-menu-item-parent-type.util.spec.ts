import { NavigationMenuItemType } from 'twenty-shared/types';

import { validateNavigationMenuItemParentType } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-parent-type.util';

const isAllowed = (
  type: NavigationMenuItemType,
  parentType: NavigationMenuItemType,
) => validateNavigationMenuItemParentType({ type, parentType }).length === 0;

describe('validateNavigationMenuItemParentType', () => {
  it('should allow any item at the root', () => {
    expect(
      validateNavigationMenuItemParentType({
        type: NavigationMenuItemType.TAB,
        parentType: undefined,
      }),
    ).toEqual([]);
  });

  it('should refuse any parent for a tab', () => {
    expect(
      isAllowed(NavigationMenuItemType.TAB, NavigationMenuItemType.TAB),
    ).toBe(false);
    expect(
      isAllowed(NavigationMenuItemType.TAB, NavigationMenuItemType.SECTION),
    ).toBe(false);
  });

  it('should only allow a section inside a tab', () => {
    expect(
      isAllowed(NavigationMenuItemType.SECTION, NavigationMenuItemType.TAB),
    ).toBe(true);
    expect(
      isAllowed(NavigationMenuItemType.SECTION, NavigationMenuItemType.SECTION),
    ).toBe(false);
    expect(
      isAllowed(NavigationMenuItemType.SECTION, NavigationMenuItemType.FOLDER),
    ).toBe(false);
  });

  it('should allow a folder inside a tab or a section but not a folder', () => {
    expect(
      isAllowed(NavigationMenuItemType.FOLDER, NavigationMenuItemType.TAB),
    ).toBe(true);
    expect(
      isAllowed(NavigationMenuItemType.FOLDER, NavigationMenuItemType.SECTION),
    ).toBe(true);
    expect(
      isAllowed(NavigationMenuItemType.FOLDER, NavigationMenuItemType.FOLDER),
    ).toBe(false);
  });

  it('should allow other items inside a tab, a section or a folder only', () => {
    expect(
      isAllowed(NavigationMenuItemType.LINK, NavigationMenuItemType.TAB),
    ).toBe(true);
    expect(
      isAllowed(NavigationMenuItemType.LINK, NavigationMenuItemType.SECTION),
    ).toBe(true);
    expect(
      isAllowed(NavigationMenuItemType.LINK, NavigationMenuItemType.FOLDER),
    ).toBe(true);
    expect(
      isAllowed(NavigationMenuItemType.LINK, NavigationMenuItemType.OBJECT),
    ).toBe(false);
  });
});
