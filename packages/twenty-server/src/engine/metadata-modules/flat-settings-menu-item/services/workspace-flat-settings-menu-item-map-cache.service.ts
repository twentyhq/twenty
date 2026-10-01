import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatSettingsMenuItemMaps } from 'src/engine/metadata-modules/flat-settings-menu-item/types/flat-settings-menu-item-maps.type';
import { fromSettingsMenuItemEntityToFlatSettingsMenuItem } from 'src/engine/metadata-modules/flat-settings-menu-item/utils/from-settings-menu-item-entity-to-flat-settings-menu-item.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_SETTINGS_MENU_ITEM_ROWS_REQUIREMENT = {
  settingsMenuItem: true,
  application: ['id', 'universalIdentifier'],
  frontComponent: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatSettingsMenuItemMaps', { packingPonderation: 1 })
export class WorkspaceFlatSettingsMenuItemMapCacheService extends MetadataFlatEntityMapsCacheProvider<'settingsMenuItem'> {
  override readonly rowsRequirement = FLAT_SETTINGS_MENU_ITEM_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_SETTINGS_MENU_ITEM_ROWS_REQUIREMENT
  >): FlatSettingsMenuItemMaps {
    const {
      settingsMenuItem: settingsMenuItems,
      application: applications,
      frontComponent: frontComponents,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const frontComponentIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(frontComponents);

    const flatSettingsMenuItemMaps = createEmptyFlatEntityMaps();

    for (const settingsMenuItemEntity of settingsMenuItems) {
      const flatSettingsMenuItem =
        fromSettingsMenuItemEntityToFlatSettingsMenuItem({
          entity: settingsMenuItemEntity,
          applicationIdToUniversalIdentifierMap,
          frontComponentIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatSettingsMenuItem,
        flatEntityMapsToMutate: flatSettingsMenuItemMaps,
      });
    }

    return flatSettingsMenuItemMaps;
  }
}
