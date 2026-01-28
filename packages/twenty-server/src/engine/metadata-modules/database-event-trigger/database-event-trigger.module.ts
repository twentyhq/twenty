import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CallDatabaseEventTriggerJobsJob } from 'src/engine/metadata-modules/database-event-trigger/jobs/call-database-event-trigger-jobs.job';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogicFunctionEntity])],
  providers: [CallDatabaseEventTriggerJobsJob],
  exports: [],
})
export class DatabaseEventTriggerModule {}
