import { Module } from '@nestjs/common';

import { SyncAccessGroupsJob } from 'src/engine/permissions/internal/access-group/jobs/sync-access-groups.job';
import { AccessGroupSyncListener } from 'src/engine/permissions/internal/access-group/listeners/access-group-sync.listener';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { AccessGroupService } from 'src/engine/permissions/internal/access-group/services/access-group.service';
import { RecordPermissionOrmModule } from 'src/engine/permissions/internal/record-permission-orm/record-permission-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [RecordPermissionOrmModule, WorkspaceCacheModule],
  providers: [
    AccessGroupService,
    AccessGroupSyncListener,
    AccessGroupSyncSchedulerService,
    SyncAccessGroupsJob,
  ],
  exports: [AccessGroupService],
})
export class AccessGroupModule {}
