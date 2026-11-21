import { msg, t } from '@lingui/core/macro';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateNavigationMenuItemCommandMenuItemReference = ({
  commandMenuItemUniversalIdentifier,
  flatCommandMenuItemMaps,
}: {
  commandMenuItemUniversalIdentifier: string | null;
  flatCommandMenuItemMaps: MetadataUniversalFlatEntityMaps<'commandMenuItem'>;
}): FlatEntityValidationError<NavigationMenuItemExceptionCode>[] => {
  if (!isDefined(commandMenuItemUniversalIdentifier)) {
    return [];
  }

  const commandMenuItem = findFlatEntityByUniversalIdentifier({
    universalIdentifier: commandMenuItemUniversalIdentifier,
    flatEntityMaps: flatCommandMenuItemMaps,
  });

  if (!isDefined(commandMenuItem)) {
    return [
      {
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Target command menu item not found`,
        userFriendlyMessage: msg`Target command not found`,
      },
    ];
  }

  if (
    commandMenuItem.availabilityType !== CommandMenuItemAvailabilityType.GLOBAL
  ) {
    return [
      {
        code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        message: t`Only a global command menu item can be added to the navigation menu`,
        userFriendlyMessage: msg`Only a global command can be added to the navigation menu`,
      },
    ];
  }

  return [];
};
