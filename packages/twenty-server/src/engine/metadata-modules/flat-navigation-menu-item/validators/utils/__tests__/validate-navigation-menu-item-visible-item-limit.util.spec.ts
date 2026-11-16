import { NavigationMenuItemType } from 'twenty-shared/types';

import { validateNavigationMenuItemVisibleItemLimit } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-visible-item-limit.util';

describe('validateNavigationMenuItemVisibleItemLimit', () => {
  it('should accept items without a limit', () => {
    expect(
      validateNavigationMenuItemVisibleItemLimit({
        type: NavigationMenuItemType.LINK,
        visibleItemLimit: null,
      }),
    ).toEqual([]);
  });

  it('should accept a positive limit on a section', () => {
    expect(
      validateNavigationMenuItemVisibleItemLimit({
        type: NavigationMenuItemType.SECTION,
        visibleItemLimit: 5,
      }),
    ).toEqual([]);
  });

  it('should refuse a limit on anything but a section', () => {
    expect(
      validateNavigationMenuItemVisibleItemLimit({
        type: NavigationMenuItemType.FOLDER,
        visibleItemLimit: 5,
      }),
    ).toHaveLength(1);
  });

  it('should refuse a limit below one', () => {
    expect(
      validateNavigationMenuItemVisibleItemLimit({
        type: NavigationMenuItemType.SECTION,
        visibleItemLimit: 0,
      }),
    ).toHaveLength(1);
  });
});
