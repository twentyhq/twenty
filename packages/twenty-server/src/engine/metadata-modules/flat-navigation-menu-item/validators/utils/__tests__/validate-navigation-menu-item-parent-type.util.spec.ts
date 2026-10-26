import { NavigationMenuItemType } from 'twenty-shared/types';

import { validateNavigationMenuItemParentType } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-parent-type.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';

describe('validateNavigationMenuItemParentType', () => {
  it.each([
    [NavigationMenuItemType.SECTION, NavigationMenuItemType.TAB],
    [NavigationMenuItemType.AI_CHAT_TRIAGE, NavigationMenuItemType.TAB],
    [NavigationMenuItemType.AI_AGENTS, NavigationMenuItemType.TAB],
    [NavigationMenuItemType.AI_CHAT_CHANNELS, NavigationMenuItemType.TAB],
    [NavigationMenuItemType.FOLDER, NavigationMenuItemType.TAB],
    [NavigationMenuItemType.FOLDER, NavigationMenuItemType.SECTION],
    [NavigationMenuItemType.VIEW, NavigationMenuItemType.TAB],
    [NavigationMenuItemType.LINK, NavigationMenuItemType.SECTION],
    [NavigationMenuItemType.OBJECT, NavigationMenuItemType.FOLDER],
  ])('accepts a %s inside a %s', (type, parentType) => {
    expect(validateNavigationMenuItemParentType({ type, parentType })).toEqual(
      [],
    );
  });

  it.each([
    [NavigationMenuItemType.TAB, NavigationMenuItemType.TAB],
    [NavigationMenuItemType.TAB, NavigationMenuItemType.SECTION],
    [NavigationMenuItemType.SECTION, NavigationMenuItemType.SECTION],
    [NavigationMenuItemType.SECTION, NavigationMenuItemType.FOLDER],
    [NavigationMenuItemType.AI_CHAT_RECENTS, NavigationMenuItemType.SECTION],
    [NavigationMenuItemType.LINK, NavigationMenuItemType.AI_CHAT_FAVORITES],
    [NavigationMenuItemType.AI_AGENTS, NavigationMenuItemType.SECTION],
    [NavigationMenuItemType.AI_CHAT_CHANNELS, NavigationMenuItemType.SECTION],
    [NavigationMenuItemType.VIEW, NavigationMenuItemType.AI_AGENTS],
    [NavigationMenuItemType.FOLDER, NavigationMenuItemType.FOLDER],
    [NavigationMenuItemType.RECORD, NavigationMenuItemType.LINK],
  ])('rejects a %s inside a %s', (type, parentType) => {
    expect(validateNavigationMenuItemParentType({ type, parentType })).toEqual([
      expect.objectContaining({
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      }),
    ]);
  });

  it('accepts an item without a parent', () => {
    expect(
      validateNavigationMenuItemParentType({
        type: NavigationMenuItemType.SECTION,
        parentType: undefined,
      }),
    ).toEqual([]);
  });
});
