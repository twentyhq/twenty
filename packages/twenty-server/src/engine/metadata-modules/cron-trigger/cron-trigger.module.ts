import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CronTriggerCronCommand } from 'src/engine/metadata-modules/cron-trigger/crons/commands/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/engine/metadata-modules/cron-trigger/crons/jobs/cron-trigger.cron.job';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity, ServerlessFunctionEntity])],
  providers: [CronTriggerCronJob, CronTriggerCronCommand],
  exports: [CronTriggerCronCommand],
})
export class CronTriggerModule {}
