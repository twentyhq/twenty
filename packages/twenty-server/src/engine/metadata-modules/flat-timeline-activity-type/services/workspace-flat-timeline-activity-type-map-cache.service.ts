import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatTimelineActivityTypeMaps } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type-maps.type';
import { fromTimelineActivityTypeEntityToFlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/utils/from-timeline-activity-type-entity-to-flat-timeline-activity-type.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatTimelineActivityTypeMaps', { packingPonderation: 1 })
export class WorkspaceFlatTimelineActivityTypeMapCacheService extends FlatEntityMapCacheProvider<'timelineActivityType'> {
  override readonly fetchRequirements = {
    timelineActivityType: true,
    application: ['id', 'universalIdentifier', 'deletedAt'],
  } as const;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatTimelineActivityTypeMaps {
    const {
      timelineActivityType: timelineActivityTypes,
      application: applications,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        // the previous application fetch excluded soft-deleted rows
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

    const flatTimelineActivityTypeMaps = createEmptyFlatEntityMaps();

    for (const timelineActivityTypeEntity of timelineActivityTypes) {
      const flatTimelineActivityType =
        fromTimelineActivityTypeEntityToFlatTimelineActivityType({
          entity: timelineActivityTypeEntity,
          applicationIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatTimelineActivityType,
        flatEntityMapsToMutate: flatTimelineActivityTypeMaps,
      });
    }

    return flatTimelineActivityTypeMaps;
  }
}
