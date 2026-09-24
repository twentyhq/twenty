import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { fromViewFilterGroupEntityToFlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-view-filter-group-entity-to-flat-view-filter-group.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_VIEW_FILTER_GROUP_ROWS_REQUIREMENT = {
  viewFilterGroup: {
    columns: true,
    groupBy: ['parentViewFilterGroupId'],
  },
  application: ['id', 'universalIdentifier'],
  viewFilter: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['viewFilterGroupId'],
  },
  view: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatViewFilterGroupMaps', { packingPonderation: 1 })
export class WorkspaceFlatViewFilterGroupMapCacheService extends MetadataFlatEntityMapsCacheProvider<'viewFilterGroup'> {
  override readonly rowsRequirement = FLAT_VIEW_FILTER_GROUP_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_VIEW_FILTER_GROUP_ROWS_REQUIREMENT
  >): FlatViewFilterGroupMaps {
    const {
      viewFilterGroup: viewFilterGroups,
      application: applications,
      viewFilter: viewFilters,
      view: views,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const viewFilterGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(viewFilterGroups.rows);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);

    const flatViewFilterGroupMaps = createEmptyFlatEntityMaps();

    for (const viewFilterGroupEntity of viewFilterGroups.rows) {
      const flatViewFilterGroup =
        fromViewFilterGroupEntityToFlatViewFilterGroup({
          entity: {
            ...viewFilterGroupEntity,
            viewFilters:
              viewFilters.byViewFilterGroupId.get(viewFilterGroupEntity.id) ||
              [],
            childViewFilterGroups:
              viewFilterGroups.byParentViewFilterGroupId.get(
                viewFilterGroupEntity.id,
              ) || [],
          },
          applicationIdToUniversalIdentifierMap,
          viewFilterGroupIdToUniversalIdentifierMap,
          viewIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewFilterGroup,
        flatEntityMapsToMutate: flatViewFilterGroupMaps,
      });
    }

    return flatViewFilterGroupMaps;
  }
}
