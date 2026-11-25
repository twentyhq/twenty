import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuItemCreationRank } from 'src/engine/metadata-modules/navigation-menu-item/utils/get-navigation-menu-item-creation-rank.util';

describe('getNavigationMenuItemCreationRank', () => {
  it('should order tabs, then sections, then folders, then other items', () => {
    const types = [
      NavigationMenuItemType.LINK,
      NavigationMenuItemType.FOLDER,
      NavigationMenuItemType.SECTION,
      NavigationMenuItemType.TAB,
    ];

    expect(
      [...types].sort(
        (a, b) =>
          getNavigationMenuItemCreationRank(a) -
          getNavigationMenuItemCreationRank(b),
      ),
    ).toEqual([
      NavigationMenuItemType.TAB,
      NavigationMenuItemType.SECTION,
      NavigationMenuItemType.FOLDER,
      NavigationMenuItemType.LINK,
    ]);
  });
});
