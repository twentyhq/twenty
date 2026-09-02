import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { transformPageLayoutTabEntityToFlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/transform-page-layout-tab-entity-to-flat-page-layout-tab.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_PAGE_LAYOUT_TAB_ROWS_REQUIREMENT = {
  pageLayoutTab: true,
  pageLayoutWidget: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['pageLayoutTabId'],
  },
  application: ['id', 'universalIdentifier'],
  pageLayout: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatPageLayoutTabMaps', { packingPonderation: 2 })
export class WorkspaceFlatPageLayoutTabMapCacheService extends MetadataFlatEntityMapsCacheProvider<'pageLayoutTab'> {
  override readonly rowsRequirement = FLAT_PAGE_LAYOUT_TAB_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_PAGE_LAYOUT_TAB_ROWS_REQUIREMENT
  >): FlatPageLayoutTabMaps {
    const {
      pageLayoutTab: pageLayoutTabs,
      pageLayoutWidget: pageLayoutWidgets,
      application: applications,
      pageLayout: pageLayouts,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const pageLayoutIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayouts);

    const flatPageLayoutTabMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutTabEntity of pageLayoutTabs) {
      const flatPageLayoutTab = transformPageLayoutTabEntityToFlatPageLayoutTab(
        {
          entity: {
            ...pageLayoutTabEntity,
            widgets:
              pageLayoutWidgets.byPageLayoutTabId.get(pageLayoutTabEntity.id) ||
              [],
          },
          applicationIdToUniversalIdentifierMap,
          pageLayoutIdToUniversalIdentifierMap,
        },
      );

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPageLayoutTab,
        flatEntityMapsToMutate: flatPageLayoutTabMaps,
      });
    }

    return flatPageLayoutTabMaps;
  }
}
