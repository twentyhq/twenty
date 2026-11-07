import { Module } from '@nestjs/common';

import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [AccessGroupSyncSchedulerService],
  exports: [AccessGroupSyncSchedulerService],
})
export class AccessGroupSyncSchedulerModule {}
