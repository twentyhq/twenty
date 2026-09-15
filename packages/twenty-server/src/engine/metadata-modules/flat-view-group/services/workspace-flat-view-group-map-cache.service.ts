import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { fromViewGroupEntityToFlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/utils/from-view-group-entity-to-flat-view-group.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_VIEW_GROUP_ROWS_REQUIREMENT = {
  viewGroup: true,
  application: ['id', 'universalIdentifier'],
  view: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatViewGroupMaps', { packingPonderation: 2 })
export class WorkspaceFlatViewGroupMapCacheService extends MetadataFlatEntityMapsCacheProvider<'viewGroup'> {
  override readonly rowsRequirement = FLAT_VIEW_GROUP_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_VIEW_GROUP_ROWS_REQUIREMENT
  >): FlatViewGroupMaps {
    const {
      viewGroup: viewGroups,
      application: applications,
      view: views,
    } = rows;

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
