import { Module, OnModuleInit } from '@nestjs/common';

import { DatabaseEventTriggerService } from 'src/modules/workflow/workflow-trigger/database-event-trigger/database-event-trigger.service';

@Module({
  providers: [DatabaseEventTriggerService],
})
export class TraceableModule implements OnModuleInit {
  constructor(
    private readonly databaseEventTriggerService: DatabaseEventTriggerService,
  ) {}

  async onModuleInit() {
    await this.databaseEventTriggerService.registerTraceableSubscriber();
  }
}
