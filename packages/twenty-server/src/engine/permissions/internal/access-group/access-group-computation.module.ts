import { Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { RecomputeRecordAccessGroupIdsOfRecordsJob } from 'src/engine/permissions/internal/access-group/jobs/recompute-record-access-group-ids-of-records.job';
import { RecomputeRecordAccessGroupIdsJob } from 'src/engine/permissions/internal/access-group/jobs/recompute-record-access-group-ids.job';
import { SyncAccessGroupsJob } from 'src/engine/permissions/internal/access-group/jobs/sync-access-groups.job';
import { AccessGroupSyncListener } from 'src/engine/permissions/internal/access-group/listeners/access-group-sync.listener';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    CacheLockModule,
    RecordPermissionRepositoryModule,
    WorkspaceCacheModule,
  ],
  providers: [
    RecordAccessGroupComputationService,
    AccessGroupSyncService,
    AccessGroupSyncListener,
    AccessGroupSyncSchedulerService,
    RecomputeRecordAccessGroupIdsJob,
    RecomputeRecordAccessGroupIdsOfRecordsJob,
    SyncAccessGroupsJob,
  ],
  exports: [AccessGroupSyncService, RecordAccessGroupComputationService],
})
export class AccessGroupComputationModule {}
