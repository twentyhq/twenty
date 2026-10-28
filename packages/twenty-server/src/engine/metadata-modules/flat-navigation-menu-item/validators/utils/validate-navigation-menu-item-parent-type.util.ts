import { msg, t } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const DEFAULT_ALLOWED_PARENT_TYPES = [
  NavigationMenuItemType.TAB,
  NavigationMenuItemType.SECTION,
  NavigationMenuItemType.FOLDER,
];

const ALLOWED_PARENT_TYPES_BY_TYPE: Partial<
  Record<NavigationMenuItemType, NavigationMenuItemType[]>
> = {
  [NavigationMenuItemType.TAB]: [],
  [NavigationMenuItemType.PINNED_COMMANDS]: [],
  [NavigationMenuItemType.SECTION]: [NavigationMenuItemType.TAB],
  [NavigationMenuItemType.AI_CHAT_INBOX]: [NavigationMenuItemType.TAB],
  [NavigationMenuItemType.AI_CHAT_FAVORITES]: [NavigationMenuItemType.TAB],
  [NavigationMenuItemType.AI_CHAT_RECENTS]: [NavigationMenuItemType.TAB],
  [NavigationMenuItemType.AI_AGENTS]: [NavigationMenuItemType.TAB],
  [NavigationMenuItemType.AI_CHAT_CHANNELS]: [NavigationMenuItemType.TAB],
  [NavigationMenuItemType.FAVORITES]: [NavigationMenuItemType.TAB],
  [NavigationMenuItemType.COMMAND]: [NavigationMenuItemType.PINNED_COMMANDS],
  [NavigationMenuItemType.FOLDER]: [
    NavigationMenuItemType.TAB,
    NavigationMenuItemType.SECTION,
  ],
};

export const validateNavigationMenuItemParentType = ({
  type,
  parentType,
}: {
  type: NavigationMenuItemType | undefined;
  parentType: NavigationMenuItemType | undefined;
}): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] => {
  if (!isDefined(type) || !isDefined(parentType)) {
    return [];
  }

  if (
    (
      ALLOWED_PARENT_TYPES_BY_TYPE[type] ?? DEFAULT_ALLOWED_PARENT_TYPES
    ).includes(parentType)
  ) {
    return [];
  }

  return [
    {
      code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      message: t`A ${type} navigation menu item cannot be placed inside a ${parentType}`,
      userFriendlyMessage: msg`A ${type} navigation menu item cannot be placed inside a ${parentType}`,
    },
  ];
};
