import { EventEmitter2 } from '@nestjs/event-emitter';

import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { isDefined } from 'twenty-shared/utils';
import { v4 as generateUuid } from 'uuid';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

type MemoryTestJobData = { payload: string; shouldFail: boolean };

const QUEUE = MessageQueue.logicFunctionQueue;
const JOB_NAME = 'JobMemoryTestJob';
const WORKSPACE_ID = 'job-memory-workspace';
const PAYLOAD = 'x'.repeat(64 * 1024);
const TEST_MAX_MEMORY_BYTES = 512 * 1024 * 1024;

const CONFIG_VALUES: Record<string, unknown> = {
  IS_REDIS_MEMORY_FAIRNESS_ENABLED: true,
  JOB_QUEUE_MAX_JOB_SIZE_BYTES: 5_242_880,
  JOB_QUEUE_MEMORY_SHARE_BY_WORKSPACE_ID: 0.3,
  JOB_QUEUE_MEMORY_SHARE_BY_APPLICATION_UNIVERSAL_IDENTIFIER: 0.4,
  JOB_QUEUE_MEMORY_RESERVE: 0.1,
};

const waitForFinishedJob = async (queue: Queue, jobId: string) => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const state = await queue.getJobState(jobId);

    if (state === 'completed' || state === 'failed') {
      return state;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Job ${jobId} did not finish`);
};

describe('BullMQDriver job memory accounting (integration)', () => {
  let connection: IORedis;
  let previousMaxMemory: string | undefined;
  let prefix: string;
  let driver: BullMQDriver;
  let inspectionQueue: Queue<MemoryTestJobData>;

  const usedKey = `jobmem:used:workspace:${WORKSPACE_ID}`;
  const readUsedBytes = async () =>
    Number((await connection.get(`${prefix}:${usedKey}`)) ?? 0);

  const waitForUsedBytes = async (expectedBytes: number) => {
    for (let attempt = 0; attempt < 50; attempt++) {
      if ((await readUsedBytes()) === expectedBytes) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    expect(await readUsedBytes()).toBe(expectedBytes);
  };

  const enqueue = async (data: Partial<MemoryTestJobData>, delay?: number) => {
    const {
      jobs: [job],
    } = await driver.bulkAdd<MemoryTestJobData>(
      QUEUE,
      JOB_NAME,
      [
        {
          data: { payload: PAYLOAD, shouldFail: false, ...data },
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: 'job-memory-app',
        },
      ],
      { delay },
    );

    return job;
  };

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

    // the limiter only charges when Redis has a maxmemory to share
    if (maxMemory === '0') {
      previousMaxMemory = maxMemory;
      await connection.config('SET', 'maxmemory', TEST_MAX_MEMORY_BYTES);
    }
  });

  beforeEach(() => {
    prefix = `job-memory-${generateUuid()}`;
    driver = new BullMQDriver(
      { connection, prefix },
      {
        recordHistogram: jest.fn(),
        incrementCounterForEvent: jest.fn(),
      } as never,
      { get: (key: string) => CONFIG_VALUES[key] } as never,
      new EventEmitter2(),
    );
    driver.register(QUEUE);
    driver.work<MemoryTestJobData>(QUEUE, async ({ data }) => {
      if (data.shouldFail) {
        throw new Error('job failed on purpose');
      }
    });
    inspectionQueue = new Queue(QUEUE, { connection, prefix });
  });

  afterEach(async () => {
    await driver.onModuleDestroy();
    await inspectionQueue.obliterate({ force: true });
    await inspectionQueue.close();

    const memoryKeys = await connection.keys(`${prefix}:jobmem:*`);

    if (memoryKeys.length > 0) {
      await connection.del(...memoryKeys);
    }
  });

  afterAll(async () => {
    if (isDefined(previousMaxMemory)) {
      await connection.config('SET', 'maxmemory', previousMaxMemory);
    }

    await connection.quit();
  });

  it('releases the charge when the job completes', async () => {
    const job = await enqueue({});

    expect(await readUsedBytes()).toBe(job.sizeBytes);
    expect(await waitForFinishedJob(inspectionQueue, job.jobId)).toBe(
      'completed',
    );
    await waitForUsedBytes(0);
  });

  it('releases the charge when the job fails for good', async () => {
    const job = await enqueue({ shouldFail: true });

    expect(await waitForFinishedJob(inspectionQueue, job.jobId)).toBe('failed');
    await waitForUsedBytes(0);
  });

  it('releases the charge of a deleted waiting job once two reconcile passes miss it', async () => {
    const job = await enqueue({}, 60 * 60 * 1000);

    await driver.reconcileJobMemory();
    await driver.reconcileJobMemory();

    expect(await readUsedBytes()).toBe(job.sizeBytes);

    await (await inspectionQueue.getJob(job.jobId))?.remove();
    await driver.reconcileJobMemory();

    expect(await readUsedBytes()).toBe(job.sizeBytes);

    await driver.reconcileJobMemory();

    expect(await readUsedBytes()).toBe(0);
  });

  it('keeps a live job charged without expiry', async () => {
    const job = await enqueue({}, 60 * 60 * 1000);

    expect(await inspectionQueue.getJobState(job.jobId)).toBe('delayed');
    expect(await readUsedBytes()).toBe(job.sizeBytes);
    expect(await connection.ttl(`${prefix}:${usedKey}`)).toBe(-1);
    expect(
      await connection.ttl(`${prefix}:jobmem:jobs:workspace:${WORKSPACE_ID}`),
    ).toBe(-1);
  });
});
