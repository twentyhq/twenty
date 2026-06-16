import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { AutomatedTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.workspace-service';
import { WorkflowCronTriggerCronCommand } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/commands/workflow-cron-trigger.cron.command';
import { WorkflowCronTriggerCronJob } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/workflow-cron-trigger-cron.job';
import { WorkflowDatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/workflow-database-event-trigger.listener';
import { WorkflowVersionCoreSyncListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/workflow-version-core-sync.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    CacheStorageModule,
    WorkflowCommonModule,
    WorkspaceDataSourceModule,
    WorkflowVersionCoreModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AutomatedTriggerWorkspaceService,
    WorkflowDatabaseEventTriggerListener,
    WorkflowVersionCoreSyncListener,
    WorkflowCronTriggerCronJob,
    WorkflowCronTriggerCronCommand,
  ],
  exports: [AutomatedTriggerWorkspaceService, WorkflowCronTriggerCronCommand],
})
export class AutomatedTriggerModule {}
