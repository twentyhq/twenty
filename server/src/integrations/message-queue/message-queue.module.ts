import { DynamicModule, Global } from '@nestjs/common';

import { MessageQueueDriver } from 'src/integrations/message-queue/drivers/interfaces/message-queue-driver.interface';

import {
  MessageQueueDriverType,
  MessageQueueModuleAsyncOptions,
} from 'src/integrations/message-queue/interfaces';
import {
  QUEUE_DRIVER,
  MessageQueues,
} from 'src/integrations/message-queue/message-queue.constants';
import { PgBossDriver } from 'src/integrations/message-queue/drivers/pg-boss.driver';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { BullMQDriver } from 'src/integrations/message-queue/drivers/bullmq.driver';

@Global()
export class MessageQueueModule {
  static forRoot(options: MessageQueueModuleAsyncOptions): DynamicModule {
    const providers = [
      {
        provide: MessageQueues.taskAssignedQueue,
        useFactory: (driver: MessageQueueDriver) => {
          return new MessageQueueService(
            driver,
            MessageQueues.taskAssignedQueue,
          );
        },
        inject: [QUEUE_DRIVER],
      },
      {
        provide: QUEUE_DRIVER,
        useFactory: async (...args: any[]) => {
          const config = await options.useFactory(...args);

          if (config.type === MessageQueueDriverType.PgBoss) {
            const boss = new PgBossDriver(config.options);

            await boss.init();

            return boss;
          }

          return new BullMQDriver(config.options);
        },
        inject: options.inject || [],
      },
    ];

    return {
      module: MessageQueueModule,
      imports: options.imports || [],
      providers,
      exports: [MessageQueues.taskAssignedQueue],
    };
  }
}
