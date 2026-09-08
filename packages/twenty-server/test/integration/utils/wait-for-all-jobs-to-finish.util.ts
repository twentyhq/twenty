import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

const POLL_INTERVAL_MS = 25;
const REQUIRED_CONSECUTIVE_QUIET_CHECKS = 2;
const STALL_TIMEOUT_MS = 15_000;
const DELAYED_JOB_PAGE_SIZE = 50;
const MAX_PROMOTABLE_DELAY_MS = 60_000;
const HARD_TIMEOUT_MS = 120_000;
const PENDING_JOB_STATES = [
  'waiting',
  'active',
  'prioritized',
  'waiting-children',
  'delayed',
] as const;

type PendingJobCounts = {
  pending: number;
  delayed: number;
};

let redisConnection: IORedis | null = null;
let queues: Queue[] | null = null;

const getQueues = (): Queue[] => {
  if (!queues) {
    redisConnection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );
    queues = Object.values(MessageQueue).map(
      (queueName) => new Queue(queueName, { connection: redisConnection! }),
    );
  }

  return queues;
};

const getPendingJobCountsByQueue = async (): Promise<
  Record<string, PendingJobCounts>
> => {
  const countsByQueue = await Promise.all(
    getQueues().map(async (queue) => {
      const jobCounts = await queue.getJobCounts(...PENDING_JOB_STATES);
      const pendingCount = Object.values(jobCounts).reduce(
        (sum, count) => sum + count,
        0,
      );

      return [
        queue.name,
        { pending: pendingCount, delayed: jobCounts.delayed ?? 0 },
      ] as const;
    }),
  );

  return Object.fromEntries(
    countsByQueue.filter(([, { pending }]) => pending > 0),
  );
};

const promoteDelayedJobs = async (queueName: string): Promise<void> => {
  const queue = getQueues().find(({ name }) => name === queueName);

  if (!queue) {
    return;
  }

  const delayedJobs = await queue.getDelayed(0, DELAYED_JOB_PAGE_SIZE);

  await Promise.all(
    delayedJobs
      .filter((job) => (job.delay ?? 0) <= MAX_PROMOTABLE_DELAY_MS)
      .map((job) => job.promote().catch(() => undefined)),
  );
};

const getActiveJobsFingerprint = async (
  busyQueueNames: string[],
): Promise<string> => {
  const activeJobIdsByQueue = await Promise.all(
    getQueues()
      .filter((queue) => busyQueueNames.includes(queue.name))
      .map(async (queue) => {
        const activeJobs = await queue.getActive(0, 50);

        return `${queue.name}:${activeJobs.map((job) => job.id).join(',')}`;
      }),
  );

  return activeJobIdsByQueue.join('|');
};

export const waitForAllJobsToFinish = async (): Promise<void> => {
  const startedAt = Date.now();
  let lastProgressAt = startedAt;
  let lastBusyFingerprint = '';
  let consecutiveQuietChecks = 0;

  while (consecutiveQuietChecks < REQUIRED_CONSECUTIVE_QUIET_CHECKS) {
    const pendingJobCountsByQueue = await getPendingJobCountsByQueue();
    const pendingTotal = Object.values(pendingJobCountsByQueue).reduce(
      (sum, { pending }) => sum + pending,
      0,
    );
    const stalledQueueNames = Object.entries(pendingJobCountsByQueue)
      .filter(([, { pending, delayed }]) => pending === delayed)
      .map(([queueName]) => queueName);

    if (pendingTotal === 0) {
      consecutiveQuietChecks += 1;
    } else {
      consecutiveQuietChecks = 0;
      const now = Date.now();

      if (now - startedAt > HARD_TIMEOUT_MS) {
        throw new Error(
          `Message queues still busy after ${HARD_TIMEOUT_MS}ms, pending jobs: ${JSON.stringify(pendingJobCountsByQueue)}`,
        );
      }

      if (stalledQueueNames.length > 0) {
        await Promise.all(stalledQueueNames.map(promoteDelayedJobs));
        lastProgressAt = now;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        continue;
      }

      const activeJobsFingerprint = await getActiveJobsFingerprint(
        Object.keys(pendingJobCountsByQueue),
      );
      const busyFingerprint = `${pendingTotal}|${activeJobsFingerprint}`;

      if (busyFingerprint !== lastBusyFingerprint) {
        lastBusyFingerprint = busyFingerprint;
        lastProgressAt = now;
      }

      if (now - lastProgressAt > STALL_TIMEOUT_MS) {
        throw new Error(
          `Message queues stalled, no progress for ${STALL_TIMEOUT_MS}ms, pending jobs: ${JSON.stringify(pendingJobCountsByQueue)}`,
        );
      }
    }

    if (consecutiveQuietChecks < REQUIRED_CONSECUTIVE_QUIET_CHECKS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
};

export const closeQueueConnections = async (): Promise<void> => {
  if (queues) {
    await Promise.allSettled(queues.map((queue) => queue.close()));
    queues = null;
  }

  if (redisConnection) {
    await redisConnection.quit().catch(() => redisConnection?.disconnect());
    redisConnection = null;
  }
};
