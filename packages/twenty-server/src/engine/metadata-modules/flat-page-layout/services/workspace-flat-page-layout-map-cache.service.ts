import { Injectable } from '@nestjs/common';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { transformPageLayoutEntityToFlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/utils/transform-page-layout-entity-to-flat-page-layout.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutMaps', { packingPonderation: 1 })
export class WorkspaceFlatPageLayoutMapCacheService extends FlatEntityMapCacheProvider<'pageLayout'> {
  override readonly fetchRequirements = {
    pageLayout: true,
    pageLayoutTab: ['id', 'universalIdentifier', 'pageLayoutId'],
    application: ['id', 'universalIdentifier'],
    objectMetadata: ['id', 'universalIdentifier'],
  } as const;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatPageLayoutMaps {
    const {
      pageLayout: pageLayouts,
      pageLayoutTab: pageLayoutTabs,
      application: applications,
      objectMetadata: objectMetadatas,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const [pageLayoutTabsByPageLayoutId] = (
      [
        {
          entities: pageLayoutTabs,
          foreignKey: 'pageLayoutId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const pageLayoutTabIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayoutTabs);

    const flatPageLayoutMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutEntity of pageLayouts) {
      const flatPageLayout = transformPageLayoutEntityToFlatPageLayout({
        entity: {
          ...pageLayoutEntity,
          tabs: pageLayoutTabsByPageLayoutId.get(pageLayoutEntity.id) || [],
        },
        applicationIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        pageLayoutTabIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPageLayout,
        flatEntityMapsToMutate: flatPageLayoutMaps,
      });
    }

    return flatPageLayoutMaps;
  }
}
