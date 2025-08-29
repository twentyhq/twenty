import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CronTriggerCronCommand } from 'src/engine/metadata-modules/trigger/crons/commands/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/engine/metadata-modules/trigger/crons/jobs/cron-trigger.cron.job';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CronTrigger } from 'src/engine/metadata-modules/trigger/entities/cron-trigger.entity';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/metadata-modules/trigger/jobs/call-database-event-trigger-jobs.job';
import { DatabaseEventTrigger } from 'src/engine/metadata-modules/trigger/entities/database-event-trigger.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, CronTrigger, DatabaseEventTrigger]),
  ],
  providers: [
    CronTriggerCronJob,
    CronTriggerCronCommand,
    CallDatabaseEventTriggerJobsJob,
  ],
  exports: [CronTriggerCronCommand],
})
export class TriggerModule {}
