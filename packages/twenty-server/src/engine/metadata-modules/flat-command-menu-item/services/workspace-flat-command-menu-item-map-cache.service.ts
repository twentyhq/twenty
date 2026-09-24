import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { fromCommandMenuItemEntityToFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-command-menu-item-entity-to-flat-command-menu-item.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_COMMAND_MENU_ITEM_ROWS_REQUIREMENT = {
  commandMenuItem: true,
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  frontComponent: ['id', 'universalIdentifier'],
  pageLayout: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatCommandMenuItemMaps', { packingPonderation: 4 })
export class WorkspaceFlatCommandMenuItemMapCacheService extends MetadataFlatEntityMapsCacheProvider<'commandMenuItem'> {
  override readonly rowsRequirement = FLAT_COMMAND_MENU_ITEM_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_COMMAND_MENU_ITEM_ROWS_REQUIREMENT
  >): FlatCommandMenuItemMaps {
    const {
      commandMenuItem: commandMenuItems,
      application: applications,
      objectMetadata: objectMetadatas,
      frontComponent: frontComponents,
      pageLayout: pageLayouts,
    } = rows;

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
