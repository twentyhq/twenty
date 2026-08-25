import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { fromViewGroupEntityToFlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/utils/from-view-group-entity-to-flat-view-group.util';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewGroupMaps', { packingPonderation: 2 })
export class WorkspaceFlatViewGroupMapCacheService extends WorkspaceCacheProvider<FlatViewGroupMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(ViewGroupEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ViewEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatViewGroupMaps {
    const viewGroups = recomputeContext.getRows(ViewGroupEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const views = recomputeContext.getRows(ViewEntity);

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
