import { msg, t } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateNavigationMenuItemVisibleItemLimit = ({
  type,
  visibleItemLimit,
}: {
  type: NavigationMenuItemType | undefined;
  visibleItemLimit: number | null | undefined;
}): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] => {
  if (!isDefined(visibleItemLimit)) {
    return [];
  }

  if (type !== NavigationMenuItemType.SECTION) {
    return [
      {
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`visibleItemLimit is only allowed on SECTION items`,
        userFriendlyMessage: msg`Only sections can limit how many items they show.`,
      },
    ];
  }

  if (!Number.isInteger(visibleItemLimit) || visibleItemLimit < 1) {
    return [
      {
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`visibleItemLimit must be a positive integer`,
        userFriendlyMessage: msg`A section must show at least one item.`,
      },
    ];
  }

  return [];
};
