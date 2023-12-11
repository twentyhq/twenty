import PgBoss from 'pg-boss';

import { QueueJobOptions } from 'src/integrations/message-queue/drivers/interfaces/job-options.interface';

import { MessageQueueDriver } from './interfaces/message-queue-driver.interface';

export type PgBossDriverOptions = PgBoss.ConstructorOptions;

export class PgBossDriver implements MessageQueueDriver {
  private pgBoss: PgBoss;

  constructor(options: PgBossDriverOptions) {
    this.pgBoss = new PgBoss(options);
  }

  async stop() {
    await this.pgBoss.stop();
  }

  async init(): Promise<void> {
    await this.pgBoss.start();
  }

  async work<T>(
    queueName: string,
    handler: ({ data, id }: { data: T; id: string }) => Promise<void>,
  ) {
    return this.pgBoss.work(queueName, handler);
  }

  async add<T>(
    queueName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<void> {
    await this.pgBoss.send(queueName, data as object, options ? options : {});
  }
}
