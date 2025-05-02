import { Module } from '@nestjs/common';

import { AnalyticsModule } from 'src/engine/core-modules/audit/analytics.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([WorkspaceMemberWorkspaceEntity]),
    TimelineActivityModule,
    AnalyticsModule,
  ],
  providers: [UpsertTimelineActivityFromInternalEvent],
})
export class TimelineJobModule {}
