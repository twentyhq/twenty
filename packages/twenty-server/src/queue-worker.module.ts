import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/integrations/environment/environment.module';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { LoggerModule } from 'src/integrations/logger/logger.module';
import { loggerModuleFactory } from 'src/integrations/logger/logger.module-factory';
import { MessageQueueModule } from 'src/integrations/message-queue/message-queue.module';
import { messageQueueModuleFactory } from 'src/integrations/message-queue/message-queue.module-factory';
import { FetchMessagesJob } from 'src/workspace/messaging/jobs/fetch-messages.job';

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
  ],
  providers: [
    {
      provide: FetchMessagesJob.name,
      useClass: FetchMessagesJob,
    },
  ],
})
export class QueueWorkerModule {}
