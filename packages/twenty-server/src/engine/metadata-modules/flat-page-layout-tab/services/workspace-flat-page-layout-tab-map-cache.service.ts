import { Injectable } from '@nestjs/common';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { transformPageLayoutTabEntityToFlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/transform-page-layout-tab-entity-to-flat-page-layout-tab.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutTabMaps', { packingPonderation: 2 })
export class WorkspaceFlatPageLayoutTabMapCacheService extends FlatEntityMapCacheProvider<'pageLayoutTab'> {
  override readonly fetchRequirements = {
    pageLayoutTab: true,
    pageLayoutWidget: ['id', 'universalIdentifier', 'pageLayoutTabId'],
    application: ['id', 'universalIdentifier'],
    pageLayout: ['id', 'universalIdentifier'],
  } as const;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatPageLayoutTabMaps {
    const {
      pageLayoutTab: pageLayoutTabs,
      pageLayoutWidget: pageLayoutWidgets,
      application: applications,
      pageLayout: pageLayouts,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const [pageLayoutWidgetsByPageLayoutTabId] = (
      [
        {
          entities: pageLayoutWidgets,
          foreignKey: 'pageLayoutTabId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

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
              pageLayoutWidgetsByPageLayoutTabId.get(pageLayoutTabEntity.id) ||
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
