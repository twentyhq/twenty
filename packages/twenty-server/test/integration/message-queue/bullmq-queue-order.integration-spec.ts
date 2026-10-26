import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as generateUuid } from 'uuid';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MESSAGE_QUEUE_WORKER_CONFIG } from 'src/engine/core-modules/message-queue/message-queue-worker-config.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

const createSignal = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

// Real Redis and workers: mocks cannot establish ordering across queues.
describe('BullMQDriver queue ordering (integration)', () => {
  it('preserves FIFO per queue without making one queue wait for another', async () => {
    const connection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );
    const options = { connection, prefix: `queue-order-${generateUuid()}` };
    // These queues initially have default job priorities 2 and 3 respectively.
    const queue1 = MessageQueue.workflowQueue;
    const queue2 = MessageQueue.delayedJobsQueue;
    const inspectionQueues = [queue1, queue2].map(
      (name) => new Queue(name, options),
    );
    const driver = new BullMQDriver(
      options,
      {
        recordHistogram: jest.fn(),
        incrementCounterForEvent: jest.fn(),
      } as unknown as MetricsService,
      {} as never,
      {} as never,
    );
    const started: string[] = [];
    const firstStarted = createSignal();
    const releaseFirst = createSignal();
    const secondQueueDone = createSignal();
    const firstQueueDone = createSignal();

    driver.register(queue1);
    driver.register(queue2);

    try {
      // Enqueue all four before starting workers so producer timing cannot
      // explain the observed FIFO order. The fourth job is queue1-3.
      await driver.add(queue1, 'job-queue1-1', {});
      await driver.add(queue2, 'job-queue2-1', {});
      await driver.add(queue1, 'job-queue1-2', {});
      await driver.add(queue1, 'job-queue1-3', {});

      driver.work(
        queue1,
        async (job) => {
          started.push(job.name);
          if (job.name === 'job-queue1-1') {
            firstStarted.resolve();
            await releaseFirst.promise;
          }
          if (job.name === 'job-queue1-3') {
            firstQueueDone.resolve();
          }
        },
        MESSAGE_QUEUE_WORKER_CONFIG[queue1].workerOptions,
      );

      await firstStarted.promise;
      driver.work(
        queue2,
        async (job) => {
          started.push(job.name);
          secondQueueDone.resolve();
        },
        MESSAGE_QUEUE_WORKER_CONFIG[queue2].workerOptions,
      );

      await secondQueueDone.promise;
      // queue2 progresses while queue1 is blocked with two jobs still waiting.
      expect(started).toEqual(['job-queue1-1', 'job-queue2-1']);
      releaseFirst.resolve();
      await firstQueueDone.promise;
      expect(started).toEqual([
        'job-queue1-1',
        'job-queue2-1',
        'job-queue1-2',
        'job-queue1-3',
      ]);
    } finally {
      releaseFirst.resolve();
      await driver.onModuleDestroy();
      for (const queue of inspectionQueues) {
        await queue.obliterate({ force: true });
        await queue.close();
      }
      await connection.quit();
    }
  });
});
