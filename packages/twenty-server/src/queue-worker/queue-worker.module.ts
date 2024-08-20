import { Module } from '@nestjs/common';

import { IntegrationsModule } from 'src/engine/integrations/integrations.module';
import { JobsModule } from 'src/engine/integrations/message-queue/jobs.module';
import { MessageQueueModule } from 'src/engine/integrations/message-queue/message-queue.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [
    TwentyORMModule.register({}),
    IntegrationsModule,
    MessageQueueModule.registerExplorer(),
    WorkspaceEventEmitterModule,
    JobsModule,
  ],
})
export class QueueWorkerModule {}
