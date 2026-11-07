import { Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { SyncAccessGroupsJob } from 'src/engine/permissions/internal/access-group/jobs/sync-access-groups.job';
import { AccessGroupSyncListener } from 'src/engine/permissions/internal/access-group/listeners/access-group-sync.listener';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { AccessGroupService } from 'src/engine/permissions/internal/access-group/services/access-group.service';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    CacheLockModule,
    RecordPermissionRepositoryModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AccessGroupService,
    AccessGroupSyncListener,
    AccessGroupSyncSchedulerService,
    SyncAccessGroupsJob,
  ],
  exports: [AccessGroupService],
})
export class AccessGroupModule {}
