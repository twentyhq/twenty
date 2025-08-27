import { Module } from '@nestjs/common';

import { CronTriggerCronCommand } from 'src/engine/metadata-modules/trigger/crons/commands/cron-trigger.cron.command';

@Module({
  providers: [CronTriggerCronCommand],
  exports: [CronTriggerCronCommand],
})
export class TriggerModule {}
