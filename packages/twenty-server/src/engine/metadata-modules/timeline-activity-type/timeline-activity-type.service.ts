import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type TimelineActivityTypeDTO } from 'src/engine/metadata-modules/timeline-activity-type/dtos/timeline-activity-type.dto';
import { fromFlatTimelineActivityTypeToTimelineActivityTypeDto } from 'src/engine/metadata-modules/timeline-activity-type/utils/from-flat-timeline-activity-type-to-timeline-activity-type-dto.util';

@Injectable()
export class TimelineActivityTypeService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async findAll({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<TimelineActivityTypeDTO[]> {
    const { flatTimelineActivityTypeMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatTimelineActivityTypeMaps'] },
      );

    return Object.values(flatTimelineActivityTypeMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(fromFlatTimelineActivityTypeToTimelineActivityTypeDto);
  }
}
