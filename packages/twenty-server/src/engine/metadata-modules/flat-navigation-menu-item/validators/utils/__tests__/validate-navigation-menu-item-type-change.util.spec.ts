import { NavigationMenuItemType } from 'twenty-shared/types';

import { validateNavigationMenuItemTypeChange } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-type-change.util';

describe('validateNavigationMenuItemTypeChange', () => {
  it('should accept a new type that fits its parent and children', () => {
    expect(
      validateNavigationMenuItemTypeChange({
        type: NavigationMenuItemType.SECTION,
        parentType: NavigationMenuItemType.TAB,
        childTypes: [
          NavigationMenuItemType.FOLDER,
          NavigationMenuItemType.LINK,
        ],
      }),
    ).toEqual([]);
  });

  it('should refuse a new type its parent cannot hold', () => {
    expect(
      validateNavigationMenuItemTypeChange({
        type: NavigationMenuItemType.TAB,
        parentType: NavigationMenuItemType.TAB,
        childTypes: [],
      }),
    ).toHaveLength(1);
  });

  it('should refuse a new type that cannot hold its children', () => {
    expect(
      validateNavigationMenuItemTypeChange({
        type: NavigationMenuItemType.SECTION,
        parentType: undefined,
        childTypes: [NavigationMenuItemType.SECTION],
      }),
    ).toHaveLength(1);
  });
});
