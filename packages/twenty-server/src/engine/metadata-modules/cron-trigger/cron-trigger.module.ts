import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CronTriggerCronCommand } from 'src/engine/metadata-modules/cron-trigger/crons/commands/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/engine/metadata-modules/cron-trigger/crons/jobs/cron-trigger.cron.job';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity, LogicFunctionEntity])],
  providers: [CronTriggerCronJob, CronTriggerCronCommand],
  exports: [CronTriggerCronCommand],
})
export class CronTriggerModule {}
