import { EventEmitter2 } from '@nestjs/event-emitter';
import { type Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as generateUuid } from 'uuid';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

jest.mock(
  'src/engine/core-modules/message-queue/message-queue-worker-config.constant',
  () => {
    const { MESSAGE_QUEUE_WORKER_CONFIG } = jest.requireActual(
      'src/engine/core-modules/message-queue/message-queue-worker-config.constant',
    );
    const { MessageQueue: ActualMessageQueue } = jest.requireActual(
      'src/engine/core-modules/message-queue/message-queue.constants',
    );

    return {
      MESSAGE_QUEUE_WORKER_CONFIG: {
        ...MESSAGE_QUEUE_WORKER_CONFIG,
        [ActualMessageQueue.workflowQueue]: {
          ...MESSAGE_QUEUE_WORKER_CONFIG[ActualMessageQueue.workflowQueue],
          groupRateLimits: { application: { max: 2, durationMs: 60_000 } },
        },
      },
    };
  },
);

const QUEUE = MessageQueue.workflowQueue;

describe('BullMQDriver group rate limit (integration)', () => {
  it('delays the jobs of a limited key past its burst on real Redis, across successive enqueues', async () => {
    const connection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );
    const options = { connection, prefix: `group-rate-${generateUuid()}` };
    const inspectionQueue = new Queue(QUEUE, options);
    const driver = new BullMQDriver(
      options,
      {
        recordHistogram: jest.fn(),
        incrementCounterForEvent: jest.fn().mockResolvedValue(undefined),
      } as never,
      {
        get: (key: string) => key === 'IS_WORKER_GROUP_RATE_LIMIT_ENABLED',
      } as never,
      new EventEmitter2(),
    );

    driver.register(QUEUE);

    try {
      await driver.bulkAdd(
        QUEUE,
        'herd-job',
        ['H1', 'H2', 'H3'].map((label) => ({ data: { label } })),
        { groupKeys: ['workspace:A', 'application:H'] },
      );
      await driver.add(
        QUEUE,
        'herd-job',
        { label: 'H4' },
        { groupKeys: ['workspace:B', 'application:H'] },
      );
      await driver.add(
        QUEUE,
        'other-job',
        { label: 'Q1' },
        { groupKeys: ['workspace:A', 'application:Q'] },
      );

      const jobs: Job[] = await inspectionQueue.getJobs([
        'prioritized',
        'waiting',
        'delayed',
      ]);
      const delayByLabel = Object.fromEntries(
        jobs.map((job) => [job.data.label, job.opts.delay ?? 0]),
      );

      expect(delayByLabel.H1).toBe(0);
      expect(delayByLabel.H2).toBe(0);
      expect(delayByLabel.H3).toBeGreaterThan(29_000);
      expect(delayByLabel.H3).toBeLessThanOrEqual(30_000);
      expect(delayByLabel.H4).toBeGreaterThan(59_000);
      expect(delayByLabel.H4).toBeLessThanOrEqual(60_000);
      expect(delayByLabel.Q1).toBe(0);
      expect(await inspectionQueue.getDelayedCount()).toBe(2);
    } finally {
      await driver.onModuleDestroy();
      await inspectionQueue.obliterate({ force: true });
      await inspectionQueue.close();
      await connection.quit();
    }
  });
});
