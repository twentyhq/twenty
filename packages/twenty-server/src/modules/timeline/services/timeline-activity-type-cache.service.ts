import { Injectable } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import {
  buildResolvedTimelineActivityTypeResolver,
  toResolvedTimelineActivityType,
  type ResolvedTimelineActivityType,
  type TimelineActivityTypeResolver,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { TimelineException } from 'src/modules/timeline/exceptions/timeline.exception';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class TimelineActivityTypeCacheService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getTimelineActivityTypeResolver(
    workspaceId: string,
  ): Promise<TimelineActivityTypeResolver> {
    const { flatTimelineActivityTypeMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatTimelineActivityTypeMaps'] },
      );

    return buildResolvedTimelineActivityTypeResolver(
      flatTimelineActivityTypeMaps,
    );
  }

  async getTimelineActivityTypeByIdOrThrow({
    workspaceId,
    timelineActivityTypeId,
  }: {
    workspaceId: string;
    timelineActivityTypeId: string;
  }): Promise<ResolvedTimelineActivityType> {
    const { flatTimelineActivityTypeMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatTimelineActivityTypeMaps'] },
      );

    const timelineActivityType = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: timelineActivityTypeId,
      flatEntityMaps: flatTimelineActivityTypeMaps,
    });

    if (!isDefined(timelineActivityType)) {
      throw new TimelineException(
        `Timeline activity type ${timelineActivityTypeId} was not found in workspace ${workspaceId}`,
      );
    }

    return toResolvedTimelineActivityType(timelineActivityType);
  }
}
