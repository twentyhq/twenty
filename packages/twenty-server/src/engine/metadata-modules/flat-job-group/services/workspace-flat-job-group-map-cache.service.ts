import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatJobGroupMaps } from 'src/engine/metadata-modules/flat-job-group/types/flat-job-group-maps.type';
import { fromJobGroupEntityToFlatJobGroup } from 'src/engine/metadata-modules/flat-job-group/utils/from-job-group-entity-to-flat-job-group.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_JOB_GROUP_ROWS_REQUIREMENT = {
  jobGroup: true,
  application: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatJobGroupMaps', { packingPonderation: 1 })
export class WorkspaceFlatJobGroupMapCacheService extends MetadataFlatEntityMapsCacheProvider<'jobGroup'> {
  override readonly rowsRequirement = FLAT_JOB_GROUP_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_JOB_GROUP_ROWS_REQUIREMENT
  >): FlatJobGroupMaps {
    const { jobGroup: jobGroups, application: applications } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatJobGroupMaps = createEmptyFlatEntityMaps();

    for (const jobGroupEntity of jobGroups) {
      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: fromJobGroupEntityToFlatJobGroup({
          entity: jobGroupEntity,
          applicationIdToUniversalIdentifierMap,
        }),
        flatEntityMapsToMutate: flatJobGroupMaps,
      });
    }

    return flatJobGroupMaps;
  }
}
