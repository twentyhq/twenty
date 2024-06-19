import { Module } from '@nestjs/common';

import { JobsModule } from 'src/engine/integrations/message-queue/jobs.module';
import { IntegrationsModule } from 'src/engine/integrations/integrations.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { MessageQueueModule } from 'src/engine/integrations/message-queue/message-queue.module';

@Module({
  imports: [
    TwentyORMModule.register({
      workspaceEntities: ['dist/src/**/*.workspace-entity{.ts,.js}'],
    }),
    IntegrationsModule,
    MessageQueueModule.registerExplorer(),
    JobsModule,
  ],
})
export class QueueWorkerModule {}
