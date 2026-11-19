import { EventEmitter2 } from '@nestjs/event-emitter';

import { type Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { v4 as generateUuid } from 'uuid';

import { BullMQDriver } from 'src/engine/core-modules/message-queue/drivers/bullmq.driver';
import { MESSAGE_QUEUE_WORKER_CONFIG } from 'src/engine/core-modules/message-queue/message-queue-worker-config.constant';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

type LimiterTestJobData = { label: string };

const QUEUE = MessageQueue.workflowQueue;
const JOB_NAME = 'LimiterTestJob';
const GROUP_KEY = 'limiter-test';
const GROUP_LIMITER = { max: 2, durationMs: 2_000 };
const INTERVAL_MS = GROUP_LIMITER.durationMs / GROUP_LIMITER.max;
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
        groupKey: GROUP_KEY,
        workspaceId,
        applicationUniversalIdentifier,
      })),
      { delay, doNotCheckDuplicatesBasedOnPrefix: true },
    );

  beforeEach(() => {
    jest.replaceProperty(
      MESSAGE_QUEUE_WORKER_CONFIG[QUEUE].workerOptions,
      'groupLimiter',
      GROUP_LIMITER,
    );
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
      { get: () => undefined } as never,
      new EventEmitter2(),
    );
    driver.register(QUEUE);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await driver.onModuleDestroy();
    await inspectionQueue.obliterate({ force: true });
    await inspectionQueue.close();
    await connection.quit();
  });

  const expectDelayNear = ({
    delayMs,
    expectedDelayMs,
  }: {
    delayMs: number;
    expectedDelayMs: number;
  }) => {
    expect(delayMs).toBeGreaterThan(expectedDelayMs - TOLERANCE_MS);
    expect(delayMs).toBeLessThanOrEqual(expectedDelayMs);
  };

  it('runs the first job immediately, then spaces the next jobs by durationMs / max', async () => {
    await enqueueBulk({
      labels: ['H1', 'H2', 'H3', 'H4'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });

    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.H1).toBe(0);
    expectDelayNear({ delayMs: delayByLabel.H2, expectedDelayMs: INTERVAL_MS });
    expectDelayNear({
      delayMs: delayByLabel.H3,
      expectedDelayMs: 2 * INTERVAL_MS,
    });
    expectDelayNear({
      delayMs: delayByLabel.H4,
      expectedDelayMs: 3 * INTERVAL_MS,
    });
  });

  it('keeps one slot sequence per key across successive enqueues', async () => {
    const firstEnqueuedAt = Date.now();

    await enqueueBulk({
      labels: ['H1'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });
    await enqueueBulk({
      labels: ['H2'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });

    const elapsedMs = Date.now() - firstEnqueuedAt;
    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.H1).toBe(0);
    expect(delayByLabel.H2).toBeGreaterThan(
      INTERVAL_MS - elapsedMs - TOLERANCE_MS,
    );
    expect(delayByLabel.H2).toBeLessThanOrEqual(INTERVAL_MS);
  });

  it('gives concurrent enqueues of the same key distinct slots', async () => {
    const labels = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    await Promise.all(
      labels.map((label) =>
        enqueueBulk({
          labels: [label],
          workspaceId: 'A',
          applicationUniversalIdentifier: 'H',
        }),
      ),
    );

    const delays = Object.values(await readDelayByLabel()).sort(
      (first, second) => first - second,
    );

    expect(delays[0]).toBe(0);
    delays.slice(1).forEach((delayMs, index) => {
      expectDelayNear({
        delayMs,
        expectedDelayMs: (index + 1) * INTERVAL_MS,
      });
    });
  });

  it('gives each workspace its own slots and shares them between its applications', async () => {
    for (const [prefix, workspaceId, applicationUniversalIdentifier] of [
      ['A', 'A', 'H'],
      ['B', 'B', 'H'],
      ['Q', 'A', 'Q'],
    ]) {
      await enqueueBulk({
        labels: [`${prefix}1`],
        workspaceId,
        applicationUniversalIdentifier,
      });
    }

    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.A1).toBe(0);
    expect(delayByLabel.B1).toBe(0);
    expectDelayNear({ delayMs: delayByLabel.Q1, expectedDelayMs: INTERVAL_MS });
  });

  it('does not let an idle period build up a burst', async () => {
    await enqueueBulk({
      labels: ['H1'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });
    await new Promise((resolve) => setTimeout(resolve, 3 * INTERVAL_MS));
    await enqueueBulk({
      labels: ['I1', 'I2', 'I3'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });

    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.I1).toBe(0);
    expectDelayNear({ delayMs: delayByLabel.I2, expectedDelayMs: INTERVAL_MS });
    expectDelayNear({
      delayMs: delayByLabel.I3,
      expectedDelayMs: 2 * INTERVAL_MS,
    });
  }, 15_000);

  it('starts pacing at the caller delay', async () => {
    await enqueueBulk({
      labels: ['H1', 'H2', 'H3'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      delay: 1_500,
    });

    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.H1).toBe(1_500);
    expectDelayNear({
      delayMs: delayByLabel.H2,
      expectedDelayMs: 1_500 + INTERVAL_MS,
    });
    expectDelayNear({
      delayMs: delayByLabel.H3,
      expectedDelayMs: 1_500 + 2 * INTERVAL_MS,
    });
  });

  it('does not hold new jobs behind a delayed job of the same key', async () => {
    await enqueueBulk({
      labels: ['R1'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
      delay: 15_000,
    });
    await enqueueBulk({
      labels: ['N1'],
      workspaceId: 'A',
      applicationUniversalIdentifier: 'H',
    });

    const delayByLabel = await readDelayByLabel();

    expect(delayByLabel.R1).toBe(15_000);
    expectDelayNear({ delayMs: delayByLabel.N1, expectedDelayMs: INTERVAL_MS });
  });

  it('does not reserve a slot again for a job id that is already queued', async () => {
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
      2 * INTERVAL_MS - elapsedMs - TOLERANCE_MS,
    );
    expect(delayByLabel.F1).toBeLessThanOrEqual(2 * INTERVAL_MS);
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
    labels.forEach((label, index) => {
      expect(startedAtByLabel[label]).toBeGreaterThanOrEqual(
        index * INTERVAL_MS - TOLERANCE_MS,
      );
    });
  }, 15_000);
});
