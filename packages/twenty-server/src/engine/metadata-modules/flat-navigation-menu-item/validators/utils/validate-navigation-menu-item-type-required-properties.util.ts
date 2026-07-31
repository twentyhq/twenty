import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_ITEM_REQUIRED_UNIVERSAL_PROPERTIES_BY_TYPE } from 'src/engine/metadata-modules/flat-navigation-menu-item/constants/navigation-menu-item-required-universal-properties-by-type.constant';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const isMissingUniversalProperty = (value: unknown): boolean =>
  !isDefined(value) || (typeof value === 'string' && value.trim() === '');

export const validateNavigationMenuItemTypeRequiredProperties = ({
  flatNavigationMenuItem,
}: {
  flatNavigationMenuItem: UniversalFlatNavigationMenuItem;
}): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] => {
  const type = flatNavigationMenuItem.type;

  if (!isDefined(type)) {
    return [
      {
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Navigation menu item type is required`,
        userFriendlyMessage: msg`Navigation menu item type is required`,
      },
    ];
  }

  return NAVIGATION_MENU_ITEM_REQUIRED_UNIVERSAL_PROPERTIES_BY_TYPE[type]
    .filter((property) =>
      isMissingUniversalProperty(flatNavigationMenuItem[property]),
    )
    .map((property) => ({
      code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      message: t`${property} is required for ${type} type`,
      userFriendlyMessage: msg`${property} is required for ${type} type`,
    }));
};
