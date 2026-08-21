import { Injectable } from '@nestjs/common';

import { type TimelineActivityAction } from 'twenty-shared/timeline';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildTimelineActivityTypeIdByAction } from 'src/modules/timeline/utils/build-timeline-activity-type-id-by-action.util';

@Injectable()
export class TimelineActivityTypeCacheService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getTimelineActivityTypeIdByAction(
    workspaceId: string,
  ): Promise<Partial<Record<TimelineActivityAction, string>>> {
    const { flatTimelineActivityTypeMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatTimelineActivityTypeMaps'] },
      );

    return buildTimelineActivityTypeIdByAction(flatTimelineActivityTypeMaps);
  }
}
