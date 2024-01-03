import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { LoggerModule } from 'src/integrations/logger/logger.module';
import { loggerModuleFactory } from 'src/integrations/logger/logger.module-factory';
import { JobsModule } from 'src/integrations/message-queue/jobs.module';
import { MessageQueueModule } from 'src/integrations/message-queue/message-queue.module';
import { messageQueueModuleFactory } from 'src/integrations/message-queue/message-queue.module-factory';

@Module({
  imports: [
    EnvironmentModule.forRoot({}),
    LoggerModule.forRootAsync({
      useFactory: loggerModuleFactory,
      inject: [EnvironmentService],
    }),
    MessageQueueModule.forRoot({
      useFactory: messageQueueModuleFactory,
      inject: [EnvironmentService],
    }),
    JobsModule,
  ],
})
export class QueueWorkerModule {}
