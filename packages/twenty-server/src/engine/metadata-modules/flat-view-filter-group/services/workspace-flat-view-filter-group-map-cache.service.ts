import { Injectable } from '@nestjs/common';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { fromViewFilterGroupEntityToFlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-view-filter-group-entity-to-flat-view-filter-group.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewFilterGroupMaps', { packingPonderation: 1 })
export class WorkspaceFlatViewFilterGroupMapCacheService extends FlatEntityMapCacheProvider<'viewFilterGroup'> {
  override readonly fetchRequirements = {
    viewFilterGroup: true,
    application: ['id', 'universalIdentifier'],
    viewFilter: ['id', 'universalIdentifier', 'viewFilterGroupId'],
    view: ['id', 'universalIdentifier'],
  } as const;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatViewFilterGroupMaps {
    const {
      viewFilterGroup: viewFilterGroups,
      application: applications,
      viewFilter: viewFilters,
      view: views,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const [viewFiltersByViewFilterGroupId, childViewFilterGroupsByParentId] = (
      [
        {
          entities: viewFilters,
          foreignKey: 'viewFilterGroupId',
        },
        {
          entities: viewFilterGroups,
          foreignKey: 'parentViewFilterGroupId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const viewFilterGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(viewFilterGroups);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);

    const flatViewFilterGroupMaps = createEmptyFlatEntityMaps();

    for (const viewFilterGroupEntity of viewFilterGroups) {
      const flatViewFilterGroup =
        fromViewFilterGroupEntityToFlatViewFilterGroup({
          entity: {
            ...viewFilterGroupEntity,
            viewFilters:
              viewFiltersByViewFilterGroupId.get(viewFilterGroupEntity.id) ||
              [],
            childViewFilterGroups:
              childViewFilterGroupsByParentId.get(viewFilterGroupEntity.id) ||
              [],
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
