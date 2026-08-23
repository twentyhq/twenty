import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { TimelineActivityRuleBuilderService } from 'src/modules/timeline/services/timeline-activity-rule-builder.service';
import { TimelineActivityTargetQueryService } from 'src/modules/timeline/services/timeline-activity-target-query.service';
import { TimelineActivityTypeCacheService } from 'src/modules/timeline/services/timeline-activity-type-cache.service';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { TimelineActivityMetadataDiagnosticsService } from 'src/modules/timeline/services/timeline-activity-metadata-diagnostics.service';
import { TimelineActivityEventEligibilityService } from 'src/modules/timeline/services/timeline-activity-event-eligibility.service';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      TimelineActivityWorkspaceEntity,
    ]),
    TwentyORMModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    MetricsModule,
  ],
  providers: [
    TimelineActivityService,
    TimelineActivityRuleBuilderService,
    TimelineActivityTargetQueryService,
    TimelineActivityTypeCacheService,
    TimelineActivityMetadataDiagnosticsService,
    TimelineActivityEventEligibilityService,
  ],
  exports: [
    TimelineActivityService,
    TimelineActivityTypeCacheService,
    TimelineActivityEventEligibilityService,
  ],
})
export class TimelineActivityModule {}
