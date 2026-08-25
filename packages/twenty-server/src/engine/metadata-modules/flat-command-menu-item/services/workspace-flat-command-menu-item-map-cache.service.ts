import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { fromCommandMenuItemEntityToFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-command-menu-item-entity-to-flat-command-menu-item.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatCommandMenuItemMaps', { packingPonderation: 4 })
export class WorkspaceFlatCommandMenuItemMapCacheService extends WorkspaceCacheProvider<FlatCommandMenuItemMaps> {
  override readonly fetchRequirements = {
    commandMenuItem: true,
    application: ['id', 'universalIdentifier'],
    objectMetadata: ['id', 'universalIdentifier'],
    frontComponent: ['id', 'universalIdentifier'],
    pageLayout: ['id', 'universalIdentifier'],
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatCommandMenuItemMaps {
    const {
      commandMenuItem: commandMenuItems,
      application: applications,
      objectMetadata: objectMetadatas,
      frontComponent: frontComponents,
      pageLayout: pageLayouts,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const frontComponentIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(frontComponents);
    const pageLayoutIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayouts);

    const flatCommandMenuItemMaps = createEmptyFlatEntityMaps();

    for (const commandMenuItemEntity of commandMenuItems) {
      const flatCommandMenuItem =
        fromCommandMenuItemEntityToFlatCommandMenuItem({
          entity: commandMenuItemEntity,
          applicationIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          frontComponentIdToUniversalIdentifierMap,
          pageLayoutIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatCommandMenuItem,
        flatEntityMapsToMutate: flatCommandMenuItemMaps,
      });
    }

    return flatCommandMenuItemMaps;
  }
}
