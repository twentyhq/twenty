import { Inject, Module, type OnModuleDestroy } from '@nestjs/common';

import { MessageQueueDriver } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';

import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';
import { JobsModule } from 'src/engine/core-modules/message-queue/jobs.module';
import { QUEUE_DRIVER } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
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
    @Inject(QUEUE_DRIVER)
    private readonly messageQueueDriver: MessageQueueDriver,
  ) {}

  // The root module is destroyed first, so active jobs finish before any client they use is closed.
  async onModuleDestroy() {
    await this.messageQueueDriver.closeWorkers?.();
  }
}
