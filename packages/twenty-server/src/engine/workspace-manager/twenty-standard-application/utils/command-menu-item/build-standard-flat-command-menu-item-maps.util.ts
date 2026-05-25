import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { buildNavigationFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { seedCompareObjectMetadataForNavigationPosition } from 'src/engine/metadata-modules/flat-command-menu-item/utils/seed-compare-object-metadata-for-navigation-position.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const STANDARD_COMMAND_MENU_ITEM_NAMES = Object.keys(
  STANDARD_COMMAND_MENU_ITEMS,
) as Array<keyof typeof STANDARD_COMMAND_MENU_ITEMS>;

export const buildStandardFlatCommandMenuItemMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  dependencyFlatEntityMaps: { flatObjectMetadataMaps },
}: {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  };
}): FlatCommandMenuItemMaps => {
  const flatCommandMenuItemMaps: FlatCommandMenuItemMaps =
    createEmptyFlatEntityMaps();

  for (const commandMenuItemName of STANDARD_COMMAND_MENU_ITEM_NAMES) {
    const flatCommandMenuItem = createStandardCommandMenuItemFlatMetadata({
      commandMenuItemName,
      commandMenuItemId: v4(),
      workspaceId,
      twentyStandardApplicationId,
      dependencyFlatEntityMaps: {
        flatObjectMetadataMaps,
      },
      now,
    });

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: flatCommandMenuItem,
      flatEntityMapsToMutate: flatCommandMenuItemMaps,
    });
  }

  const activeObjects = Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((flatObject) => flatObject.isActive)
    .sort(seedCompareObjectMetadataForNavigationPosition);

  const maxStandardPosition = Object.values(
    flatCommandMenuItemMaps.byUniversalIdentifier,
  ).reduce(
    (max, item) => (isDefined(item) ? Math.max(max, item.position) : max),
    -1,
  );

  let nextPosition = maxStandardPosition + 1;

  for (const flatObject of activeObjects) {
    const position = nextPosition++;

    const navigationItem = buildNavigationFlatCommandMenuItem({
      objectMetadata: flatObject,
      commandMenuItemId: v4(),
      applicationId: twentyStandardApplicationId,
      workspaceId,
      position,
      now,
    });

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: navigationItem,
      flatEntityMapsToMutate: flatCommandMenuItemMaps,
    });
  }

  return flatCommandMenuItemMaps;
};
