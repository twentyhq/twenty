import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { fromNavigationMenuItemEntityToFlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-navigation-menu-item-entity-to-flat-navigation-menu-item.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';

const FLAT_NAVIGATION_MENU_ITEM_ROWS_REQUIREMENT = {
  navigationMenuItem: true,
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  view: ['id', 'universalIdentifier'],
  pageLayout: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatNavigationMenuItemMaps', { packingPonderation: 1 })
export class WorkspaceFlatNavigationMenuItemMapCacheService extends MetadataFlatEntityMapsCacheProvider<'navigationMenuItem'> {
  override readonly rowsRequirement =
    FLAT_NAVIGATION_MENU_ITEM_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_NAVIGATION_MENU_ITEM_ROWS_REQUIREMENT
  >): FlatNavigationMenuItemMaps {
    const {
      navigationMenuItem: navigationMenuItems,
      application: applications,
      objectMetadata: objectMetadatas,
      view: views,
      pageLayout: pageLayouts,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const navigationMenuItemIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(navigationMenuItems);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);
    const pageLayoutIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayouts);

    const flatNavigationMenuItemMaps = {
      ...createEmptyFlatEntityMaps(),
      byUserWorkspaceIdAndFolderId: {},
    };

    for (const navigationMenuItemEntity of navigationMenuItems) {
      const flatNavigationMenuItem =
        fromNavigationMenuItemEntityToFlatNavigationMenuItem({
          entity: navigationMenuItemEntity,
          applicationIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          navigationMenuItemIdToUniversalIdentifierMap,
          viewIdToUniversalIdentifierMap,
          pageLayoutIdToUniversalIdentifierMap,
        });

      addFlatNavigationMenuItemToMapsAndUpdateIndex({
        flatNavigationMenuItem,
        flatNavigationMenuItemMaps,
      });
    }

    return flatNavigationMenuItemMaps;
  }
}
