import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CallDatabaseEventTriggerJobsJob } from 'src/engine/metadata-modules/database-event-trigger/jobs/call-database-event-trigger-jobs.job';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServerlessFunctionEntity])],
  providers: [CallDatabaseEventTriggerJobsJob],
  exports: [],
})
export class DatabaseEventTriggerModule {}
