import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { TimelineActivityRuleResolverService } from 'src/modules/timeline/services/timeline-activity-rule-resolver.service';
import { TimelineActivityTargetResolverService } from 'src/modules/timeline/services/timeline-activity-target-resolver.service';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

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
    TimelineActivityRuleResolverService,
    TimelineActivityTargetResolverService,
  ],
  exports: [TimelineActivityService],
})
export class TimelineActivityModule {}
