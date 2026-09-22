import { DEFAULT_SETTINGS_MENU_ITEM_POSITION } from '@/application/constants/DefaultSettingsMenuItemPosition';

type SortableSettingsMenuItem = {
  universalIdentifier: string;
  position?: number | null;
};

export const sortSettingsMenuItems = <
  TSettingsMenuItem extends SortableSettingsMenuItem,
>(
  settingsMenuItems: TSettingsMenuItem[],
): TSettingsMenuItem[] =>
  [...settingsMenuItems].sort((firstItem, secondItem) => {
    const firstPosition =
      firstItem.position ?? DEFAULT_SETTINGS_MENU_ITEM_POSITION;
    const secondPosition =
      secondItem.position ?? DEFAULT_SETTINGS_MENU_ITEM_POSITION;

    if (firstPosition !== secondPosition) {
      return firstPosition - secondPosition;
    }

    return firstItem.universalIdentifier.localeCompare(
      secondItem.universalIdentifier,
    );
  });
