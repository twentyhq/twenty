import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RecomputeRecordAccessGroupIdsCommand } from 'src/engine/permissions/internal/access-group/commands/recompute-record-access-group-ids.command';
import { RecomputeRecordAccessGroupIdsOfRecordsJob } from 'src/engine/permissions/internal/access-group/jobs/recompute-record-access-group-ids-of-records.job';
import { ComputeRecordAccessGroupIdsDeferredOperationHandlerService } from 'src/engine/permissions/internal/access-group/deferred-operation-handlers/compute-record-access-group-ids-deferred-operation-handler.service';
import { SyncAccessGroupsJob } from 'src/engine/permissions/internal/access-group/jobs/sync-access-groups.job';
import { AccessGroupSyncListener } from 'src/engine/permissions/internal/access-group/listeners/access-group-sync.listener';
import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { RlsWorkspaceMemberRelationValueMapsCacheService } from 'src/engine/permissions/internal/rls/services/rls-workspace-member-relation-value-maps-cache.service';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    CacheLockModule,
    MetricsModule,
    RecordPermissionRepositoryModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    AccessGroupPropagationPlanService,
    RecordAccessGroupComputationService,
    RecordAccessGroupMetadataMapsService,
    RecordAccessGroupPropagationService,
    AccessGroupSyncService,
    AccessGroupSyncListener,
    AccessGroupSyncSchedulerService,
    ComputeRecordAccessGroupIdsDeferredOperationHandlerService,
    RecomputeRecordAccessGroupIdsOfRecordsJob,
    RecomputeRecordAccessGroupIdsCommand,
    SyncAccessGroupsJob,
    RlsWorkspaceMemberRelationValueMapsCacheService,
  ],
  exports: [
    AccessGroupPropagationPlanService,
    AccessGroupSyncSchedulerService,
    AccessGroupSyncService,
    RecordAccessGroupComputationService,
    RecordAccessGroupPropagationService,
  ],
})
export class AccessGroupComputationModule {}
