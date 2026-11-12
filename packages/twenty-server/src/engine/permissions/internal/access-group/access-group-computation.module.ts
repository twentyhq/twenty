import { Module } from '@nestjs/common';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { RecomputeRecordAccessGroupIdsOfRecordsJob } from 'src/engine/permissions/internal/access-group/jobs/recompute-record-access-group-ids-of-records.job';
import { RecomputeRelatedRecordPathTargetsJob } from 'src/engine/permissions/internal/access-group/jobs/recompute-related-record-path-targets.job';
import { ApplyAccessGroupPropagationPlanJob } from 'src/engine/permissions/internal/access-group/jobs/apply-access-group-propagation-plan.job';
import { SyncAccessGroupsJob } from 'src/engine/permissions/internal/access-group/jobs/sync-access-groups.job';
import { AccessGroupSyncListener } from 'src/engine/permissions/internal/access-group/listeners/access-group-sync.listener';
import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';
import { AccessGroupSyncSchedulerService } from 'src/engine/permissions/internal/access-group/services/access-group-sync-scheduler.service';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { RelatedRecordPathReadModule } from 'src/engine/permissions/internal/related-record-path/related-record-path-read.module';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    CacheLockModule,
    RecordPermissionRepositoryModule,
    RelatedRecordPathReadModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AccessGroupPropagationPlanService,
    RecordAccessGroupComputationService,
    RecordAccessGroupMetadataMapsService,
    RecordAccessGroupPropagationService,
    AccessGroupSyncService,
    AccessGroupSyncListener,
    AccessGroupSyncSchedulerService,
    ApplyAccessGroupPropagationPlanJob,
    RecomputeRecordAccessGroupIdsOfRecordsJob,
    RecomputeRelatedRecordPathTargetsJob,
    SyncAccessGroupsJob,
  ],
  exports: [
    AccessGroupPropagationPlanService,
    AccessGroupSyncService,
    RecordAccessGroupComputationService,
    RecordAccessGroupPropagationService,
  ],
})
export class AccessGroupComputationModule {}
