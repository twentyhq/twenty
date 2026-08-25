import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { transformPageLayoutTabEntityToFlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/transform-page-layout-tab-entity-to-flat-page-layout-tab.util';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutTabMaps', { packingPonderation: 2 })
export class WorkspaceFlatPageLayoutTabMapCacheService extends WorkspaceCacheProvider<FlatPageLayoutTabMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(PageLayoutTabEntity),
    entityFetchRequirement(PageLayoutWidgetEntity, [
      'id',
      'universalIdentifier',
      'pageLayoutTabId',
    ]),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(PageLayoutEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatPageLayoutTabMaps {
    const pageLayoutTabs = recomputeContext.getRows(PageLayoutTabEntity);
    const pageLayoutWidgets = recomputeContext.getRows(PageLayoutWidgetEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const pageLayouts = recomputeContext.getRows(PageLayoutEntity);

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
