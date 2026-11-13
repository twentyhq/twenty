import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewTabMaps } from 'src/engine/metadata-modules/flat-view-tab/types/flat-view-tab-maps.type';
import { fromViewTabEntityToFlatViewTab } from 'src/engine/metadata-modules/flat-view-tab/utils/from-view-tab-entity-to-flat-view-tab.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_VIEW_TAB_ROWS_REQUIREMENT = {
  viewTab: true,
  application: ['id', 'universalIdentifier'],
  view: ['id', 'universalIdentifier'],
  viewFilter: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['viewTabId'],
  },
} as const;

@Injectable()
@WorkspaceCache('flatViewTabMaps', { packingPonderation: 1 })
export class WorkspaceFlatViewTabMapCacheService extends MetadataFlatEntityMapsCacheProvider<'viewTab'> {
  override readonly rowsRequirement = FLAT_VIEW_TAB_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_VIEW_TAB_ROWS_REQUIREMENT
  >): FlatViewTabMaps {
    const {
      viewTab: viewTabs,
      application: applications,
      view: views,
      viewFilter: viewFilters,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);

    const flatViewTabMaps = createEmptyFlatEntityMaps();

    for (const viewTabEntity of viewTabs) {
      const flatViewTab = fromViewTabEntityToFlatViewTab({
        entity: {
          ...viewTabEntity,
          viewFilters: viewFilters.byViewTabId.get(viewTabEntity.id) || [],
        },
        applicationIdToUniversalIdentifierMap,
        viewIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewTab,
        flatEntityMapsToMutate: flatViewTabMaps,
      });
    }

    return flatViewTabMaps;
  }
}
