import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { TimelineActivityRuleBuilderService } from 'src/modules/timeline/services/timeline-activity-rule-builder.service';
import { TimelineActivityTargetQueryService } from 'src/modules/timeline/services/timeline-activity-target-query.service';
import { TimelineActivityTypeCacheService } from 'src/modules/timeline/services/timeline-activity-type-cache.service';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { TimelineActivityCreateQueryHookService } from 'src/modules/timeline/query-hooks/timeline-activity-create-query-hook.service';
import { TimelineActivityCreateOnePreQueryHook } from 'src/modules/timeline/query-hooks/timeline-activity-create-one.pre-query-hook';
import { TimelineActivityCreateManyPreQueryHook } from 'src/modules/timeline/query-hooks/timeline-activity-create-many.pre-query-hook';
import { TimelineActivityUpdateOnePreQueryHook } from 'src/modules/timeline/query-hooks/timeline-activity-update-one.pre-query-hook';
import { TimelineActivityUpdateManyPreQueryHook } from 'src/modules/timeline/query-hooks/timeline-activity-update-many.pre-query-hook';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      TimelineActivityWorkspaceEntity,
    ]),
    TwentyORMModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    TimelineActivityService,
    TimelineActivityRuleBuilderService,
    TimelineActivityTargetQueryService,
    TimelineActivityTypeCacheService,
    TimelineActivityCreateQueryHookService,
    TimelineActivityCreateOnePreQueryHook,
    TimelineActivityCreateManyPreQueryHook,
    TimelineActivityUpdateOnePreQueryHook,
    TimelineActivityUpdateManyPreQueryHook,
  ],
  exports: [TimelineActivityService, TimelineActivityTypeCacheService],
})
export class TimelineActivityModule {}
