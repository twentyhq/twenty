import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AutomatedTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.workspace-service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/database-event-trigger.listener';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CronTriggerCronCommand } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/commands/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/cron-trigger.cron.job';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';

@Module({
  imports: [
    FeatureFlagModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkflowCommonModule,
  ],
  providers: [
    AutomatedTriggerWorkspaceService,
    DatabaseEventTriggerListener,
    CronTriggerCronJob,
    CronTriggerCronCommand,
  ],
  exports: [AutomatedTriggerWorkspaceService],
})
export class AutomatedTriggerModule {}
