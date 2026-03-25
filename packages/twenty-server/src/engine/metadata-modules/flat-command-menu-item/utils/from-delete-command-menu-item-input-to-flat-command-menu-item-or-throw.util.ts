import { isDefined } from 'twenty-shared/utils';

import {
  CommandMenuItemException,
  CommandMenuItemExceptionCode,
} from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

export const fromDeleteCommandMenuItemInputToFlatCommandMenuItemOrThrow = ({
  flatCommandMenuItemMaps,
  commandMenuItemId,
}: {
  flatCommandMenuItemMaps: FlatCommandMenuItemMaps;
  commandMenuItemId: string;
}): FlatCommandMenuItem => {
  const existingFlatCommandMenuItem = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: commandMenuItemId,
    flatEntityMaps: flatCommandMenuItemMaps,
  });

  if (!isDefined(existingFlatCommandMenuItem)) {
    throw new CommandMenuItemException(
      'Command menu item not found',
      CommandMenuItemExceptionCode.COMMAND_MENU_ITEM_NOT_FOUND,
    );
  }

  return existingFlatCommandMenuItem;
};
