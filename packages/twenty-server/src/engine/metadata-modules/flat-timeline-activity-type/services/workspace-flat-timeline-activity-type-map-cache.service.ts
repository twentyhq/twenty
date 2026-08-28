import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatTimelineActivityTypeMaps } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type-maps.type';
import { fromTimelineActivityTypeEntityToFlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/utils/from-timeline-activity-type-entity-to-flat-timeline-activity-type.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_TIMELINE_ACTIVITY_TYPE_ROWS_REQUIREMENT = {
  timelineActivityType: true,
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const;

@Injectable()
@WorkspaceCache('flatTimelineActivityTypeMaps', { packingPonderation: 1 })
export class WorkspaceFlatTimelineActivityTypeMapCacheService extends MetadataFlatEntityMapsCacheProvider<'timelineActivityType'> {
  override readonly rowsRequirement =
    FLAT_TIMELINE_ACTIVITY_TYPE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_TIMELINE_ACTIVITY_TYPE_ROWS_REQUIREMENT
  >): FlatTimelineActivityTypeMaps {
    const {
      timelineActivityType: timelineActivityTypes,
      application: applications,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
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
