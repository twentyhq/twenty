import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as generateUuid } from 'uuid';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MESSAGE_QUEUE_WORKER_CONFIG } from 'src/engine/core-modules/message-queue/message-queue-worker-config.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

const createSignal = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

// Real Redis and workers: mocks cannot establish ordering across queues.
describe('BullMQDriver queue ordering (integration)', () => {
  it.each([false, true])(
    'processes queues independently (explicit priorities: %s)',
    async (explicitPriorities) => {
      const connection = new IORedis(
        process.env.REDIS_QUEUE_URL ??
          process.env.REDIS_URL ??
          'redis://localhost:6379',
        { maxRetriesPerRequest: null },
      );
      const options = { connection, prefix: `queue-order-${generateUuid()}` };
      const queue1 = MessageQueue.workflowQueue;
      const queue2 = MessageQueue.delayedJobsQueue;
      const inspectionQueues = [queue1, queue2].map(
        (name) => new Queue(name, options),
      );
      const module = await Test.createTestingModule({
        providers: [
          {
            provide: MetricsService,
            useValue: {
              recordHistogram: jest.fn(),
              incrementCounterForEvent: jest.fn(),
            },
          },
          { provide: TwentyConfigService, useValue: {} },
          { provide: EventEmitter2, useValue: new EventEmitter2() },
          {
            provide: BullMQDriver,
            useFactory: (
              metrics: MetricsService,
              config: TwentyConfigService,
              events: EventEmitter2,
            ) => new BullMQDriver(options, metrics, config, events),
            inject: [MetricsService, TwentyConfigService, EventEmitter2],
          },
        ],
      }).compile();
      const driver = module.get(BullMQDriver);
      const started: string[] = [];
      const firstStarted = createSignal();
      const releaseFirst = createSignal();
      const secondQueueDone = createSignal();
      const firstQueueDone = createSignal();
      const priorityJobsDone = createSignal();

      driver.register(queue1);
      driver.register(queue2);

      try {
        await driver.add(
          queue1,
          'job-queue1-1',
          {},
          explicitPriorities ? { priority: 1 } : undefined,
        );
        await driver.add(
          queue2,
          'job-queue2-1',
          {},
          explicitPriorities ? { priority: 0 } : undefined,
        );
        await driver.add(
          queue1,
          'job-queue1-2',
          {},
          explicitPriorities ? { priority: 1 } : undefined,
        );
        await driver.add(
          queue1,
          'job-queue1-3',
          {},
          explicitPriorities ? { priority: 1 } : undefined,
        );

        driver.work(
          queue1,
          async (job) => {
            started.push(job.name);
            if (job.name === 'job-queue1-1') {
              firstStarted.resolve();
              await releaseFirst.promise;
            }
            if (job.name === 'application-job') {
              priorityJobsDone.resolve();
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
        expect(started).toEqual(['job-queue1-1', 'job-queue2-1']);
        releaseFirst.resolve();
        await firstQueueDone.promise;
        expect(started).toEqual([
          'job-queue1-1',
          'job-queue2-1',
          'job-queue1-2',
          'job-queue1-3',
        ]);
        await inspectionQueues[0].pause();
        await driver.add(queue1, 'application-job', {}, { priority: 10 });
        await driver.add(queue1, 'ordinary-job', {});
        await driver.add(queue1, 'urgent-job', {}, { priority: 1 });
        await driver.add(queue1, 'zero-priority-job', {}, { priority: 0 });
        await inspectionQueues[0].resume();
        await priorityJobsDone.promise;
        expect(started.slice(4)).toEqual([
          'zero-priority-job',
          'urgent-job',
          'ordinary-job',
          'application-job',
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
    },
  );
});
