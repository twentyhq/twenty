import { WorkflowVersionCoreModule } from 'src/engine/core-modules/workflow/workflow-version-core.module';
import { Module } from '@nestjs/common';

import { WorkflowCoreModule } from 'src/engine/core-modules/workflow/workflow-core.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { CronModule } from 'src/engine/core-modules/cron/cron.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowCronTriggerCronCommand } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/commands/workflow-cron-trigger.cron.command';
import { WorkflowCronTriggerCronJob } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/workflow-cron-trigger-cron.job';
import { WorkflowDatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/workflow-database-event-trigger.listener';

@Module({
  imports: [
    ApplicationModule,
    CoreEntityCacheModule,
    WorkflowVersionCoreModule,
    WorkflowCoreModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    CronModule,
    RecordShareModule,
    WorkflowCommonModule,
    WorkspaceCacheModule,
  ],
  providers: [
    WorkflowDatabaseEventTriggerListener,
    WorkflowCronTriggerCronJob,
    WorkflowCronTriggerCronCommand,
  ],
  exports: [WorkflowCronTriggerCronCommand],
})
export class AutomatedTriggerModule {}
