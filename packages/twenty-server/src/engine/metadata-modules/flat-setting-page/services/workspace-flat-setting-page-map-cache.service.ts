import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatSettingPageMaps } from 'src/engine/metadata-modules/flat-setting-page/types/flat-setting-page-maps.type';
import { fromSettingPageEntityToFlatSettingPage } from 'src/engine/metadata-modules/flat-setting-page/utils/from-setting-page-entity-to-flat-setting-page.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_SETTING_PAGE_ROWS_REQUIREMENT = {
  settingPage: true,
  application: ['id', 'universalIdentifier'],
  frontComponent: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatSettingPageMaps', { packingPonderation: 1 })
export class WorkspaceFlatSettingPageMapCacheService extends MetadataFlatEntityMapsCacheProvider<'settingPage'> {
  override readonly rowsRequirement = FLAT_SETTING_PAGE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_SETTING_PAGE_ROWS_REQUIREMENT
  >): FlatSettingPageMaps {
    const {
      settingPage: settingPages,
      application: applications,
      frontComponent: frontComponents,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const frontComponentIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(frontComponents);

    const flatSettingPageMaps = createEmptyFlatEntityMaps();

    for (const settingPageEntity of settingPages) {
      const flatSettingPage = fromSettingPageEntityToFlatSettingPage({
        entity: settingPageEntity,
        applicationIdToUniversalIdentifierMap,
        frontComponentIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatSettingPage,
        flatEntityMapsToMutate: flatSettingPageMaps,
      });
    }

    return flatSettingPageMaps;
  }
}
