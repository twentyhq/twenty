import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { fromViewFilterEntityToFlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/utils/from-view-filter-entity-to-flat-view-filter.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_VIEW_FILTER_ROWS_REQUIREMENT = {
  viewFilter: true,
  application: ['id', 'universalIdentifier'],
  fieldMetadata: ['id', 'universalIdentifier'],
  viewFilterGroup: ['id', 'universalIdentifier'],
  view: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatViewFilterMaps', { packingPonderation: 1 })
export class WorkspaceFlatViewFilterMapCacheService extends MetadataFlatEntityMapsCacheProvider<'viewFilter'> {
  override readonly rowsRequirement = FLAT_VIEW_FILTER_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_VIEW_FILTER_ROWS_REQUIREMENT
  >): FlatViewFilterMaps {
    const {
      viewFilter: viewFilters,
      application: applications,
      fieldMetadata: fieldMetadatas,
      viewFilterGroup: viewFilterGroups,
      view: views,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);
    const viewFilterGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(viewFilterGroups);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);

    const flatViewFilterMaps = createEmptyFlatEntityMaps();

    for (const viewFilterEntity of viewFilters) {
      const flatViewFilter = fromViewFilterEntityToFlatViewFilter({
        entity: viewFilterEntity,
        applicationIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
        viewFilterGroupIdToUniversalIdentifierMap,
        viewIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewFilter,
        flatEntityMapsToMutate: flatViewFilterMaps,
      });
    }

    return flatViewFilterMaps;
  }
}
