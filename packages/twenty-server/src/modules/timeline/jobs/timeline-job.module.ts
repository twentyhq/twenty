import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { CreateAuditLogFromInternalEvent } from 'src/modules/timeline/jobs/create-audit-log-from-internal-event';
import { UpsertTimelineActivityFromInternalEvent } from 'src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job';
import { AuditLogWorkspaceEntity } from 'src/modules/timeline/standard-objects/audit-log.workspace-entity';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      WorkspaceMemberWorkspaceEntity,
      AuditLogWorkspaceEntity,
    ]),
    TimelineActivityModule,
  ],
  providers: [
    CreateAuditLogFromInternalEvent,
    UpsertTimelineActivityFromInternalEvent,
  ],
})
export class TimelineJobModule {}
