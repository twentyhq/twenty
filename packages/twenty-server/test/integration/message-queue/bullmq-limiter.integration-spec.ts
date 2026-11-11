import { EventEmitter2 } from '@nestjs/event-emitter';

import { type Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as generateUuid } from 'uuid';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { type QueueJobLimiter } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { MESSAGE_QUEUE_WORKER_CONFIG } from 'src/engine/core-modules/message-queue/message-queue-worker-config.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

type LimiterTestJobData = { label: string };

const QUEUE = MessageQueue.workflowQueue;
const JOB_NAME = 'LimiterTestJob';
const LIMITER: QueueJobLimiter = {
  key: 'workflow:limiter-test',
  max: 2,
  durationMs: 2_000,
};
const INTERVAL_MS = LIMITER.durationMs / LIMITER.max;
// Redis TIME and the enqueue round trips drift the delays by a few ms.
const TOLERANCE_MS = 150;

describe('BullMQDriver limiter (integration)', () => {
  let connection: IORedis;
  let driver: BullMQDriver;
  let inspectionQueue: Queue<LimiterTestJobData>;

  const readDelayByLabel = async () => {
    const jobs: Job<LimiterTestJobData>[] = await inspectionQueue.getJobs([
      'prioritized',
      'waiting',
      'delayed',
    ]);

    return Object.fromEntries(
      jobs.map((job) => [job.data.label, job.opts.delay ?? 0]),
    );
  };

  const enqueueBulk = async ({
    labels,
    workspaceId,
    applicationUniversalIdentifier,
    jobIds,
    delay,
  }: {
    labels: string[];
    workspaceId: string;
    applicationUniversalIdentifier: string;
    jobIds?: string[];
    delay?: number;
  }) =>
    driver.bulkAdd<LimiterTestJobData>(
      QUEUE,
      JOB_NAME,
      labels.map((label, index) => ({
        data: { label },
        jobId: jobIds?.[index],
        limiter: LIMITER,
        workspaceId,
        applicationUniversalIdentifier,
      })),
      { delay, doNotCheckDuplicatesBasedOnPrefix: true },
    );

  beforeEach(() => {
    connection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );

    const options = { connection, prefix: `limiter-${generateUuid()}` };

    inspectionQueue = new Queue(QUEUE, options);
    driver = new BullMQDriver(
      options,
      {
        recordHistogram: jest.fn(),
        incrementCounterForEvent: jest.fn().mockResolvedValue(undefined),
      } as never,
      {
        get: (key: string) => key === 'IS_WORKER_GROUP_LIMITER_ENABLED',
      } as never,
      new EventEmitter2(),
    );
    driver.register(QUEUE);
  });

  afterEach(async () => {
    await driver.onModuleDestroy();
    await inspectionQueue.obliterate({ force: true });
    await inspectionQueue.close();
    await connection.quit();
  });

  it('lets the burst through, then spaces the next jobs by durationMs / max', async () => {
    await enqueueBulk({
      labels: ['H1', 'H2', 'H3', 'H4'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });

    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.H1).toBe(0);
    expect(delayByLabel.H2).toBe(0);
    expect(delayByLabel.H3).toBeGreaterThan(INTERVAL_MS - TOLERANCE_MS);
    expect(delayByLabel.H3).toBeLessThanOrEqual(INTERVAL_MS);
    expect(delayByLabel.H4).toBeGreaterThan(2 * INTERVAL_MS - TOLERANCE_MS);
    expect(delayByLabel.H4).toBeLessThanOrEqual(2 * INTERVAL_MS);
  });

  it('keeps one budget per key across successive enqueues', async () => {
    const firstEnqueuedAt = Date.now();

    await enqueueBulk({
      labels: ['H1', 'H2'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });
    await enqueueBulk({
      labels: ['H3'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });

    const elapsedMs = Date.now() - firstEnqueuedAt;
    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.H3).toBeGreaterThan(
      INTERVAL_MS - elapsedMs - TOLERANCE_MS,
    );
    expect(delayByLabel.H3).toBeLessThanOrEqual(INTERVAL_MS);
  });

  it('gives each workspace and each application its own budget for the same key', async () => {
    for (const [prefix, workspaceId, applicationUniversalIdentifier] of [
      ['A', 'A', 'H'],
      ['B', 'B', 'H'],
      ['Q', 'A', 'Q'],
    ]) {
      await enqueueBulk({
        labels: [`${prefix}1`, `${prefix}2`],
        workspaceId,
        applicationUniversalIdentifier,
      });
    }

    expect(Object.values(await readDelayByLabel())).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('starts pacing at the caller delay', async () => {
    await enqueueBulk({
      labels: ['H1', 'H2', 'H3'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      delay: 1_500,
    });

    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.H1).toBe(1_500);
    expect(delayByLabel.H2).toBe(1_500);
    expect(delayByLabel.H3).toBeGreaterThan(1_500 + INTERVAL_MS - TOLERANCE_MS);
    expect(delayByLabel.H3).toBeLessThanOrEqual(1_500 + INTERVAL_MS);
  });

  it('does not charge the budget again for a job id that is already queued', async () => {
    const firstEnqueuedAt = Date.now();

    await enqueueBulk({
      labels: ['H1', 'H2'],
      jobIds: ['job-1', 'job-2'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });
    await enqueueBulk({
      labels: ['R1', 'R2'],
      jobIds: ['job-1', 'job-2'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });
    await enqueueBulk({
      labels: ['F1'],
      jobIds: ['job-3'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });

    const elapsedMs = Date.now() - firstEnqueuedAt;
    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.F1).toBeGreaterThan(
      INTERVAL_MS - elapsedMs - TOLERANCE_MS,
    );
    expect(delayByLabel.F1).toBeLessThanOrEqual(INTERVAL_MS);
  });

  it('runs the paced jobs no faster than the limiter allows', async () => {
    const startedAtByLabel: Record<string, number> = {};
    const labels = ['H1', 'H2', 'H3', 'H4'];
    let resolveAllStarted: () => void = () => {};
    const allStarted = new Promise<void>((resolve) => {
      resolveAllStarted = resolve;
    });

    // Started before enqueueing so worker startup cannot shift the first jobs.
    driver.work<LimiterTestJobData>(
      QUEUE,
      async (job) => {
        startedAtByLabel[job.data.label] = Date.now() - enqueuedAt;

        if (Object.keys(startedAtByLabel).length === labels.length) {
          resolveAllStarted();
        }
      },
      MESSAGE_QUEUE_WORKER_CONFIG[QUEUE].workerOptions,
    );

    const enqueuedAt = Date.now();

    await enqueueBulk({
      labels,
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });

    await allStarted;

    // Pacing sets enqueue deadlines only, so the gaps between actual starts are not guaranteed.
    expect(startedAtByLabel.H3).toBeGreaterThanOrEqual(
      INTERVAL_MS - TOLERANCE_MS,
    );
    expect(startedAtByLabel.H4).toBeGreaterThanOrEqual(
      2 * INTERVAL_MS - TOLERANCE_MS,
    );
  }, 15_000);
});
