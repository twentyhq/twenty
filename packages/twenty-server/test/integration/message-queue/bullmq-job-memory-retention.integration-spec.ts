import { EventEmitter2 } from '@nestjs/event-emitter';

import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as generateUuid } from 'uuid';

import { JobMemoryReconcileCronJob } from 'src/engine/core-modules/message-queue/crons/jobs/job-memory-reconcile.cron.job';
import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueException } from 'src/engine/core-modules/message-queue/message-queue.exception';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

jest.mock(
  'src/engine/core-modules/message-queue/constants/queue-retention.constants',
  () => ({
    QUEUE_RETENTION: {
      completedMaxAge: 1,
      completedMaxCount: 1000,
      failedMaxAge: 1,
      failedMaxCount: 1000,
    },
  }),
);

const QUEUE = MessageQueue.logicFunctionQueue;
const WORKSPACE_ID = 'job-memory-retention-workspace';
const PAYLOAD = 'x'.repeat(64 * 1024);
const SHARE_HEADROOM_BYTES = 100_000;
const TEST_MAX_MEMORY_BYTES = 512 * 1024 * 1024;

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

describe('Job memory reconcile cron with expired retention (integration)', () => {
  let connection: IORedis;
  let previousMaxMemory: string | undefined;

  beforeAll(async () => {
    connection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );

    const [, maxMemory] = (await connection.config('GET', 'maxmemory')) as [
      string,
      string,
    ];

    if (maxMemory === '0') {
      previousMaxMemory = maxMemory;
      await connection.config('SET', 'maxmemory', TEST_MAX_MEMORY_BYTES);
    }
  });

  afterAll(async () => {
    if (previousMaxMemory !== undefined) {
      await connection.config('SET', 'maxmemory', previousMaxMemory);
    }

    await connection.quit();
  });

  it('gives a workspace its budget back once retention of its finished jobs expires', async () => {
    const prefix = `job-memory-retention-${generateUuid()}`;
    const memoryInfo = String(await connection.info('memory'));
    const readMemoryValue = (name: string) =>
      Number(new RegExp(`${name}:(\\d+)`).exec(memoryInfo)?.[1] ?? 0);
    const freeBytes =
      readMemoryValue('maxmemory') * 0.9 - readMemoryValue('used_memory');
    // a workspace share that fits one job of this test but not two
    const configValues: Record<string, unknown> = {
      IS_REDIS_MEMORY_FAIRNESS_ENABLED: true,
      JOB_QUEUE_MAX_JOB_SIZE_BYTES: 5_242_880,
      JOB_QUEUE_MEMORY_SHARE_BY_WORKSPACE_ID: SHARE_HEADROOM_BYTES / freeBytes,
      JOB_QUEUE_MEMORY_SHARE_BY_APPLICATION_UNIVERSAL_IDENTIFIER: 0.4,
      JOB_QUEUE_MEMORY_RESERVE: 0.1,
    };
    const driver = new BullMQDriver(
      { connection, prefix },
      {
        recordHistogram: jest.fn(),
        incrementCounterForEvent: jest.fn(),
      } as never,
      { get: (key: string) => configValues[key] } as never,
      new EventEmitter2(),
    );
    const cronJob = new JobMemoryReconcileCronJob(
      new MessageQueueService(driver, MessageQueue.cronQueue),
    );
    const inspectionQueue = new Queue(QUEUE, { connection, prefix });
    const enqueue = () =>
      driver.bulkAdd(QUEUE, 'JobMemoryRetentionTestJob', [
        {
          data: { payload: PAYLOAD },
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: 'job-memory-retention-app',
        },
      ]);

    driver.register(QUEUE);
    driver.work(QUEUE, async () => undefined);

    try {
      const {
        jobs: [finishedJob],
      } = await enqueue();

      for (let attempt = 0; attempt < 100; attempt++) {
        if (
          (await inspectionQueue.getJobState(finishedJob.jobId)) === 'completed'
        ) {
          break;
        }

        await sleep(100);
      }

      await expect(enqueue()).rejects.toThrow(MessageQueueException);

      await sleep(1_500);

      expect(await inspectionQueue.getJob(finishedJob.jobId)).toBeDefined();

      await cronJob.handle();

      expect(await inspectionQueue.getJob(finishedJob.jobId)).toBeUndefined();
      await expect(enqueue()).rejects.toThrow(MessageQueueException);

      await cronJob.handle();

      await expect(enqueue()).resolves.toMatchObject({
        jobs: [expect.anything()],
      });
    } finally {
      await driver.onModuleDestroy();
      await inspectionQueue.obliterate({ force: true });
      await inspectionQueue.close();

      const memoryKeys = await connection.keys(`${prefix}:jobmem:*`);

      if (memoryKeys.length > 0) {
        await connection.del(...memoryKeys);
      }
    }
  });
});
