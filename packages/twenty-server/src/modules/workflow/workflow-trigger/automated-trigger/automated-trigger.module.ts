import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { AutomatedTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.workspace-service';
import { CronTriggerCronCommand } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/commands/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/cron-trigger.cron.job';
import { DatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/database-event-trigger.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkflowCommonModule,
  ],
  providers: [
    AutomatedTriggerWorkspaceService,
    DatabaseEventTriggerListener,
    CronTriggerCronJob,
    CronTriggerCronCommand,
  ],
  exports: [AutomatedTriggerWorkspaceService, CronTriggerCronCommand],
})
export class AutomatedTriggerModule {}
