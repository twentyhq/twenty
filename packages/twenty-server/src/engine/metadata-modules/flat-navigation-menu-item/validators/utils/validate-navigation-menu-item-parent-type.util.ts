import { msg, t } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const getAllowedParentTypes = (
  type: NavigationMenuItemType,
): NavigationMenuItemType[] => {
  switch (type) {
    case NavigationMenuItemType.TAB:
      return [];
    case NavigationMenuItemType.SECTION:
    case NavigationMenuItemType.AI_CHAT_TRIAGE:
    case NavigationMenuItemType.AI_CHAT_FAVORITES:
    case NavigationMenuItemType.AI_CHAT_RECENTS:
      return [NavigationMenuItemType.TAB];
    case NavigationMenuItemType.FOLDER:
      return [NavigationMenuItemType.TAB, NavigationMenuItemType.SECTION];
    default:
      return [
        NavigationMenuItemType.TAB,
        NavigationMenuItemType.SECTION,
        NavigationMenuItemType.FOLDER,
      ];
  }
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

  if (getAllowedParentTypes(type).includes(parentType)) {
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
