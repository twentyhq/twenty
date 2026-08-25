import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { fromNavigationMenuItemEntityToFlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-navigation-menu-item-entity-to-flat-navigation-menu-item.util';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';

@Injectable()
@WorkspaceCache('flatNavigationMenuItemMaps', { packingPonderation: 1 })
export class WorkspaceFlatNavigationMenuItemMapCacheService extends WorkspaceCacheProvider<FlatNavigationMenuItemMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(NavigationMenuItemEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ObjectMetadataEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ViewEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(PageLayoutEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatNavigationMenuItemMaps {
    const navigationMenuItems = recomputeContext.getRows(
      NavigationMenuItemEntity,
    );
    const applications = recomputeContext.getRows(ApplicationEntity);
    const objectMetadatas = recomputeContext.getRows(ObjectMetadataEntity);
    const views = recomputeContext.getRows(ViewEntity);
    const pageLayouts = recomputeContext.getRows(PageLayoutEntity);

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
