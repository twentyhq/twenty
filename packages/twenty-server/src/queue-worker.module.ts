import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { MessageQueueModule } from 'src/integrations/message-queue/message-queue.module';
import { messageQueueModuleFactory } from 'src/integrations/message-queue/message-queue.module-factory';

@Module({
  imports: [
    EnvironmentModule.forRoot({}),
    MessageQueueModule.forRoot({
      useFactory: messageQueueModuleFactory,
      inject: [EnvironmentService],
    }),
  ],
})
export class QueueWorkerModule {}
