import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { fromViewGroupEntityToFlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/utils/from-view-group-entity-to-flat-view-group.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewGroupMaps', { packingPonderation: 2 })
export class WorkspaceFlatViewGroupMapCacheService extends WorkspaceCacheProvider<FlatViewGroupMaps> {
  override readonly fetchRequirements = {
    viewGroup: true,
    application: ['id', 'universalIdentifier'],
    view: ['id', 'universalIdentifier'],
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatViewGroupMaps {
    const {
      viewGroup: viewGroups,
      application: applications,
      view: views,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);

    const flatViewGroupMaps = createEmptyFlatEntityMaps();

    for (const viewGroupEntity of viewGroups) {
      const flatViewGroup = fromViewGroupEntityToFlatViewGroup({
        entity: viewGroupEntity,
        applicationIdToUniversalIdentifierMap,
        viewIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewGroup,
        flatEntityMapsToMutate: flatViewGroupMaps,
      });
    }

    return flatViewGroupMaps;
  }
}
