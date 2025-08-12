import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { AutomatedTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.workspace-service';
import { WorkflowCronTriggerCronCommand } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/commands/workflow-cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/cron-trigger.cron.job';
import { DatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/database-event-trigger.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkflowCommonModule,
    WorkspaceDataSourceModule,
  ],
  providers: [
    AutomatedTriggerWorkspaceService,
    DatabaseEventTriggerListener,
    CronTriggerCronJob,
    WorkflowCronTriggerCronCommand,
  ],
  exports: [AutomatedTriggerWorkspaceService, WorkflowCronTriggerCronCommand],
})
export class AutomatedTriggerModule {}
