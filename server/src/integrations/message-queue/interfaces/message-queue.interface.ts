import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { MessageQueueType } from 'src/integrations/environment/interfaces/message-queue.interface';

import { BullMQDriverOptions } from 'src/integrations/message-queue/drivers/bullmq.driver';
import { PgBossDriverOptions } from 'src/integrations/message-queue/drivers/pg-boss.driver';

export interface PgBossDriverFactoryOptions {
  type: MessageQueueType.PgBoss;
  options: PgBossDriverOptions;
}

export interface BullMQDriverFactoryOptions {
  type: MessageQueueType.BullMQ;
  options: BullMQDriverOptions;
}

export type MessageQueueModuleOptions =
  | PgBossDriverFactoryOptions
  | BullMQDriverFactoryOptions;

export type MessageQueueModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => MessageQueueModuleOptions | Promise<MessageQueueModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
