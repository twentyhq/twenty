import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { transformPageLayoutEntityToFlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/utils/transform-page-layout-entity-to-flat-page-layout.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_PAGE_LAYOUT_ROWS_REQUIREMENT = {
  pageLayout: true,
  pageLayoutTab: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['pageLayoutId'],
  },
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatPageLayoutMaps', { packingPonderation: 1 })
export class WorkspaceFlatPageLayoutMapCacheService extends MetadataFlatEntityMapsCacheProvider<'pageLayout'> {
  override readonly rowsRequirement = FLAT_PAGE_LAYOUT_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_PAGE_LAYOUT_ROWS_REQUIREMENT
  >): FlatPageLayoutMaps {
    const {
      pageLayout: pageLayouts,
      pageLayoutTab: pageLayoutTabs,
      application: applications,
      objectMetadata: objectMetadatas,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const pageLayoutTabIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayoutTabs.rows);

    const flatPageLayoutMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutEntity of pageLayouts) {
      const flatPageLayout = transformPageLayoutEntityToFlatPageLayout({
        entity: {
          ...pageLayoutEntity,
          tabs: pageLayoutTabs.byPageLayoutId.get(pageLayoutEntity.id) || [],
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
