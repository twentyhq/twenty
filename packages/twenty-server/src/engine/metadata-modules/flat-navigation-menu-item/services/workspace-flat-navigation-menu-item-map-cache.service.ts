import { Injectable } from '@nestjs/common';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { fromNavigationMenuItemEntityToFlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-navigation-menu-item-entity-to-flat-navigation-menu-item.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';

@Injectable()
@WorkspaceCache('flatNavigationMenuItemMaps', { packingPonderation: 1 })
export class WorkspaceFlatNavigationMenuItemMapCacheService extends FlatEntityMapCacheProvider<'navigationMenuItem'> {
  override readonly fetchRequirements = {
    navigationMenuItem: true,
    application: ['id', 'universalIdentifier'],
    objectMetadata: ['id', 'universalIdentifier'],
    view: ['id', 'universalIdentifier'],
    pageLayout: ['id', 'universalIdentifier'],
  } as const;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatNavigationMenuItemMaps {
    const {
      navigationMenuItem: navigationMenuItems,
      application: applications,
      objectMetadata: objectMetadatas,
      view: views,
      pageLayout: pageLayouts,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

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
