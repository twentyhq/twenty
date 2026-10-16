import { Module, type OnModuleDestroy } from '@nestjs/common';

import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';
import { JobsModule } from 'src/engine/core-modules/message-queue/jobs.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { MessageQueueWorkerDrainService } from 'src/engine/core-modules/message-queue/services/message-queue-worker-drain.service';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { ModulesModule } from 'src/modules/modules.module';

@Module({
  imports: [
    CoreEngineModule,
    ModulesModule,
    MessageQueueModule.registerExplorer(),
    WorkspaceEventEmitterModule,
    JobsModule,
    TwentyOrmModule,
  ],
})
export class QueueWorkerModule implements OnModuleDestroy {
  constructor(
    private readonly messageQueueWorkerDrainService: MessageQueueWorkerDrainService,
  ) {}

  async onModuleDestroy() {
    await this.messageQueueWorkerDrainService.drainWorkers();
  }
}
