import { EventEmitter2 } from '@nestjs/event-emitter';

import { existsSync } from 'fs';
import { mkdtemp, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as generateUuid } from 'uuid';

import { LocalDriver } from 'src/engine/core-modules/file-storage/drivers/local.driver';
import { ValidatedStorageDriver } from 'src/engine/core-modules/file-storage/drivers/validated-storage.driver';
import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { OFFLOADED_JOB_PAYLOAD_KEY } from 'src/engine/core-modules/message-queue/drivers/payload/offloaded-job-payload-key.constant';
import { type OffloadedJobPayload } from 'src/engine/core-modules/message-queue/drivers/payload/offloaded-job-payload.type';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

type PayloadTestJobData = { workspaceId: string; payload: string };

const QUEUE = MessageQueue.logicFunctionQueue;
const JOB_NAME = 'JobPayloadOffloadTestJob';
const WORKSPACE_ID = generateUuid();
const THRESHOLD_BYTES = 64 * 1024;
const LARGE_PAYLOAD = 'x'.repeat(256 * 1024);
const WAIT_TIMEOUT_MS = 10_000;

const waitFor = async (condition: () => Promise<boolean> | boolean) => {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;

  while (!(await condition())) {
    if (Date.now() > deadline) {
      throw new Error('Timed out waiting for the condition');
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

describe('Job payload offload (integration)', () => {
  let connection: IORedis;
  let storagePath: string;
  let prefix: string;
  let driver: BullMQDriver;
  let inspectionQueue: Queue;
  let handleJob: (data: PayloadTestJobData) => Promise<void>;

  const listStoredPayloads = async () => {
    const payloadFolder = join(
      storagePath,
      WORKSPACE_ID,
      'job-payloads',
      QUEUE,
    );

    return existsSync(payloadFolder) ? readdir(payloadFolder) : [];
  };

  const enqueue = async ({
    payload,
    retryLimit,
  }: {
    payload: string;
    retryLimit?: number;
  }) => {
    const {
      jobs: [{ jobId }],
    } = await driver.bulkAdd<PayloadTestJobData>(
      QUEUE,
      JOB_NAME,
      [
        {
          data: { workspaceId: WORKSPACE_ID, payload },
          workspaceId: WORKSPACE_ID,
          isWorkspaceJob: true,
        },
      ],
      { retryLimit },
    );

    return jobId;
  };

  beforeAll(() => {
    connection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );
  });

  afterAll(async () => {
    await connection.quit();
  });

  beforeEach(async () => {
    storagePath = await mkdtemp(join(tmpdir(), 'job-payload-offload-'));
    prefix = `job-payload-offload-${generateUuid()}`;

    const storageDriver = new ValidatedStorageDriver(
      new LocalDriver({ storagePath }),
    );
    const configValues: Record<string, unknown> = {
      IS_REDIS_MEMORY_FAIRNESS_ENABLED: false,
      IS_JOB_QUEUE_PAYLOAD_OFFLOAD_ENABLED: true,
      JOB_QUEUE_PAYLOAD_OFFLOAD_THRESHOLD_BYTES: THRESHOLD_BYTES,
      JOB_QUEUE_MAX_OFFLOADED_JOB_SIZE_BYTES: 10 * 1024 * 1024,
    };

    driver = new BullMQDriver(
      { connection, prefix },
      {
        recordHistogram: jest.fn(),
        incrementCounterForEvent: jest.fn(),
        incrementCounterBy: jest.fn(),
      } as never,
      { get: (key: string) => configValues[key] } as never,
      new EventEmitter2(),
      { getCurrentDriver: () => storageDriver },
    );
    inspectionQueue = new Queue(QUEUE, { connection, prefix });

    driver.register(QUEUE);
    driver.work<PayloadTestJobData>(QUEUE, (job) => handleJob(job.data));
  });

  afterEach(async () => {
    await driver.onModuleDestroy();
    await inspectionQueue.obliterate({ force: true });
    await inspectionQueue.close();

    const payloadKeys = await connection.keys(`${prefix}:jobpayload:*`);

    if (payloadKeys.length > 0) {
      await connection.del(...payloadKeys);
    }

    await rm(storagePath, { recursive: true, force: true });
  });

  it('keeps a small job inline', async () => {
    const receivedPayloads: string[] = [];

    handleJob = async ({ payload }) => {
      receivedPayloads.push(payload);
    };

    const jobId = await enqueue({ payload: 'small' });

    expect((await inspectionQueue.getJob(jobId))?.data).toEqual({
      workspaceId: WORKSPACE_ID,
      payload: 'small',
    });

    await waitFor(() => receivedPayloads.length === 1);

    expect(receivedPayloads).toEqual(['small']);
    expect(await listStoredPayloads()).toEqual([]);
  });

  it('offloads a large job, runs it with the full payload and deletes the file once it completes', async () => {
    const receivedPayloads: string[] = [];
    let releaseHandler: () => void = () => undefined;
    const handlerReleased = new Promise<void>((resolve) => {
      releaseHandler = resolve;
    });

    handleJob = async ({ payload }) => {
      receivedPayloads.push(payload);
      await handlerReleased;
    };

    const jobId = await enqueue({ payload: LARGE_PAYLOAD });
    const storedData = (await inspectionQueue.getJob(jobId))
      ?.data as OffloadedJobPayload;

    expect(storedData[OFFLOADED_JOB_PAYLOAD_KEY].path).toMatch(
      new RegExp(`^${WORKSPACE_ID}/job-payloads/${QUEUE}/`),
    );
    expect(JSON.stringify(storedData).length).toBeLessThan(1_000);
    expect(await listStoredPayloads()).toHaveLength(1);

    await waitFor(() => receivedPayloads.length === 1);
    releaseHandler();

    expect(receivedPayloads[0]).toBe(LARGE_PAYLOAD);

    await waitFor(async () => (await listStoredPayloads()).length === 0);

    expect(await connection.hlen(`${prefix}:jobpayload:refs`)).toBe(0);
  });

  it('keeps the payload across retries and deletes it after the final failure', async () => {
    const receivedPayloads: string[] = [];

    handleJob = async ({ payload }) => {
      receivedPayloads.push(payload);
      throw new Error('boom');
    };

    const jobId = await enqueue({ payload: LARGE_PAYLOAD, retryLimit: 1 });

    await waitFor(async () =>
      Boolean((await inspectionQueue.getJob(jobId))?.finishedOn),
    );
    await waitFor(async () => (await listStoredPayloads()).length === 0);

    expect(receivedPayloads).toEqual([LARGE_PAYLOAD, LARGE_PAYLOAD]);
    expect(await connection.hlen(`${prefix}:jobpayload:refs`)).toBe(0);
  });
});
