import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatTimelineActivityTypeMaps } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type-maps.type';
import { fromTimelineActivityTypeEntityToFlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/utils/from-timeline-activity-type-entity-to-flat-timeline-activity-type.util';
import { TimelineActivityTypeEntity } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatTimelineActivityTypeMaps', { packingPonderation: 1 })
export class WorkspaceFlatTimelineActivityTypeMapCacheService extends WorkspaceCacheProvider<FlatTimelineActivityTypeMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(TimelineActivityTypeEntity),
    entityFetchRequirement(ApplicationEntity, [
      'id',
      'universalIdentifier',
      'deletedAt',
    ]),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatTimelineActivityTypeMaps {
    const timelineActivityTypes = recomputeContext.getRows(
      TimelineActivityTypeEntity,
    );
    const applications = recomputeContext.getRows(ApplicationEntity);

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
