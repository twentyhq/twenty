import { Module } from '@nestjs/common';

import { AccessGroupSyncSchedulerModule } from 'src/engine/permissions/internal/access-group/access-group-sync-scheduler.module';
import { SyncAccessGroupsJob } from 'src/engine/permissions/internal/access-group/jobs/sync-access-groups.job';
import { AccessGroupWorkspaceMemberListener } from 'src/engine/permissions/internal/access-group/listeners/access-group-workspace-member.listener';
import { AccessGroupService } from 'src/engine/permissions/internal/access-group/services/access-group.service';
import { RecordPermissionOrmModule } from 'src/engine/permissions/internal/record-permission-orm/record-permission-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    AccessGroupSyncSchedulerModule,
    RecordPermissionOrmModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AccessGroupService,
    AccessGroupWorkspaceMemberListener,
    SyncAccessGroupsJob,
  ],
  exports: [AccessGroupService],
})
export class AccessGroupModule {}
