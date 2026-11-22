import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { createStandardNavigationMenuItemFolderFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-folder-flat-metadata.util';

export const createStandardNavigationMenuItemCommandFlatMetadata = ({
  universalIdentifier,
  commandMenuItemUniversalIdentifier,
  position,
  navigationMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  dependencyFlatEntityMaps: { flatCommandMenuItemMaps },
  now,
}: {
  universalIdentifier: string;
  commandMenuItemUniversalIdentifier: string;
  position: number;
  navigationMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  };
  now: string;
}): FlatNavigationMenuItem | undefined => {
  const flatCommandMenuItem = findFlatEntityByUniversalIdentifier({
    universalIdentifier: commandMenuItemUniversalIdentifier,
    flatEntityMaps: flatCommandMenuItemMaps,
  });

  if (!isDefined(flatCommandMenuItem)) {
    return undefined;
  }

  return {
    ...createStandardNavigationMenuItemFolderFlatMetadata({
      universalIdentifier,
      name: '',
      color: null,
      position,
      navigationMenuItemId,
      workspaceId,
      twentyStandardApplicationId,
      now,
    }),
    type: NavigationMenuItemType.COMMAND,
    name: null,
    commandMenuItemId: flatCommandMenuItem.id,
    commandMenuItemUniversalIdentifier: flatCommandMenuItem.universalIdentifier,
  };
};
