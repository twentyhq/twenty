import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { TimelineActivityRoutingPlanService } from 'src/modules/timeline/services/timeline-activity-routing-plan.service';
import { TimelineActivityTargetQueryService } from 'src/modules/timeline/services/timeline-activity-target-query.service';
import { TimelineActivityTypeCacheService } from 'src/modules/timeline/services/timeline-activity-type-cache.service';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';

@Module({
  imports: [WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [
    TimelineActivityRepository,
    TimelineActivityService,
    TimelineActivityRoutingPlanService,
    TimelineActivityTargetQueryService,
    TimelineActivityTypeCacheService,
  ],
  exports: [
    TimelineActivityService,
    TimelineActivityTypeCacheService,
    TimelineActivityRoutingPlanService,
  ],
})
export class TimelineActivityModule {}
