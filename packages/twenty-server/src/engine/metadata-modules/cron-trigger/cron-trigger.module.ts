import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CronTriggerCronCommand } from 'src/engine/metadata-modules/cron-trigger/crons/commands/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/engine/metadata-modules/cron-trigger/crons/jobs/cron-trigger.cron.job';
import { CronTrigger } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, CronTrigger])],
  providers: [CronTriggerCronJob, CronTriggerCronCommand],
  exports: [CronTriggerCronCommand],
})
export class CronTriggerModule {}
